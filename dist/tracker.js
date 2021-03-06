"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tracker = void 0;
const child_process_1 = __importDefault(require("child_process"));
const date_fns_1 = require("date-fns");
const fs_1 = require("fs");
const node_notifier_1 = __importDefault(require("node-notifier"));
const untildify_1 = __importDefault(require("untildify"));
const base_1 = require("./base");
const clickup_1 = require("./clickup");
const config_1 = require("./config");
const gitlab_1 = require("./gitlab");
const utils_1 = require("./utils");
class Tracker extends base_1.BaseFileRef {
    constructor() {
        super(...arguments);
        this.lastDeployedCommitMap = {};
    }
    get path() {
        return untildify_1.default(config_1.CONFIG.TrackListFile);
    }
    startSync() {
        this.trackTask();
        setInterval(() => {
            this.trackTask();
        }, config_1.CONFIG.TrackIntervalInMinutes * 60 * 1000);
    }
    addItem(projectName, issueNumber) {
        fs_1.appendFileSync(this.path, `\n${projectName} ${issueNumber}`);
    }
    getItems() {
        const content = this.readFile();
        const lines = content
            .split("\n")
            .filter(Boolean)
            .filter((line) => !line.startsWith("#"));
        const items = lines.map((line) => line.split(" "));
        return items;
    }
    trackTask() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[TrackNew] ${new Date().toLocaleString()}`);
            const checkDeployProjects = config_1.CONFIG.GitLabProjects.filter((p) => !!p.deployedStatus);
            for (const project of checkDeployProjects) {
                const gitLab = new gitlab_1.GitLab(project.id);
                const successPipelines = yield gitLab.listPipelines({
                    status: "success",
                    per_page: 100,
                });
                // get last commit with success pipeline with deploy job
                for (const pipeline of successPipelines) {
                    const jobs = yield gitLab.listPipelineJobs(pipeline.id);
                    const job = jobs.find((j) => j.name === "deploy-latest");
                    if (!job) {
                        continue;
                    }
                    this.lastDeployedCommitMap[project.name] = job.commit;
                    break;
                }
            }
            return Promise.all(this.getItems().map(([projectName, issueNumber]) => this.trackSingle(projectName, issueNumber)));
        });
    }
    trackSingle(projectName, issueNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            const projectConfig = utils_1.getGitLabProjectConfigByName(projectName);
            if (!(projectConfig === null || projectConfig === void 0 ? void 0 : projectConfig.deployedStatus) && !(projectConfig === null || projectConfig === void 0 ? void 0 : projectConfig.stagingStatus)) {
                return;
            }
            const gitLab = new gitlab_1.GitLab(projectConfig.id);
            const issue = yield gitLab.getIssue(issueNumber);
            const clickUpTaskId = utils_1.getClickUpTaskIdFromGitLabIssue(issue);
            if (!clickUpTaskId) {
                return;
            }
            const clickUp = new clickup_1.ClickUp(clickUpTaskId);
            const mergeRequests = yield gitLab.listMergeRequestsWillCloseIssueOnMerge(issueNumber);
            const mergeRequest = yield gitLab.getMergeRequest(mergeRequests[mergeRequests.length - 1].iid);
            if (projectConfig.stagingStatus && mergeRequest.state === "merged") {
                const clickUpTask = yield clickUp.getTask();
                if (clickUpTask.status.status === "in review") {
                    const list = yield clickup_1.ClickUp.getList(clickUpTask.list.id);
                    const stagingStatus = projectConfig.stagingStatus[list.name] ||
                        projectConfig.stagingStatus["*"];
                    yield clickUp.setTaskStatus(stagingStatus);
                    if (stagingStatus === "verified") {
                        this.closeItem(projectName, issueNumber);
                    }
                    const message = `${projectName} #${issueNumber}: In Review -> ${stagingStatus}`;
                    child_process_1.default.execSync(`osascript -e 'display notification "${message}" with title "Accel Shooter"'`);
                    console.log(message);
                    if (!projectConfig.deployedStatus) {
                        this.closeItem(projectName, issueNumber);
                    }
                }
                if (projectConfig.deployedStatus &&
                    clickUpTask.status.status === "staging" &&
                    this.lastDeployedCommitMap[projectName]) {
                    const commit = yield gitLab.getCommit(mergeRequest.merge_commit_sha);
                    const deployedCommitDate = date_fns_1.parseISO(this.lastDeployedCommitMap[projectName].created_at);
                    const mergeCommitDate = date_fns_1.parseISO(commit.created_at);
                    const compareTime = date_fns_1.compareAsc(deployedCommitDate, mergeCommitDate);
                    if (compareTime === 1 || compareTime === 0) {
                        const list = yield clickup_1.ClickUp.getList(clickUpTask.list.id);
                        const deployedStatus = projectConfig.deployedStatus[list.name] ||
                            projectConfig.deployedStatus["*"];
                        yield clickUp.setTaskStatus(deployedStatus);
                        this.closeItem(projectName, issueNumber);
                        const message = `${projectName} #${issueNumber} (Under List ${list.name}): Staging -> ${deployedStatus}`;
                        node_notifier_1.default.notify({
                            title: "Accel Shooter",
                            message,
                        });
                        console.log(message);
                    }
                }
            }
        });
    }
    closeItem(projectName, issueNumber) {
        const content = this.readFile();
        const lines = content
            .split("\n")
            .filter(Boolean)
            .filter((line) => line !== `${projectName} ${issueNumber}`);
        this.writeFile(lines.join("\n"));
    }
}
exports.Tracker = Tracker;
