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
const untildify_1 = __importDefault(require("untildify"));
const base_1 = require("./base");
const clickup_1 = require("./clickup");
const config_1 = require("./config");
const gitlab_1 = require("./gitlab");
const utils_1 = require("./utils");
class Tracker extends base_1.BaseFileRef {
    get path() {
        return untildify_1.default(config_1.CONFIG.TrackListFile);
    }
    constructor() {
        super();
        this.trackTask();
        setInterval(() => {
            this.trackTask();
        }, 5 * 60 * 1000);
    }
    getItems() {
        const content = this.readFile();
        const lines = content.split("\n").filter(Boolean);
        const items = lines.map((line) => line.split(" "));
        return items;
    }
    trackTask() {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.all(this.getItems().map(([projectId, issueNumber]) => this.trackSingle(projectId, issueNumber)));
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
                    yield clickUp.setTaskStatus(projectConfig.stagingStatus);
                }
                if (projectConfig.deployedStatus &&
                    clickUpTask.status.status === "staging") {
                    const commit = yield gitLab.getCommit(mergeRequest.merge_commit_sha);
                    if (commit.last_pipeline.status === "success") {
                        yield clickUp.setTaskStatus(projectConfig.deployedStatus);
                    }
                }
            }
        });
    }
}
exports.Tracker = Tracker;
