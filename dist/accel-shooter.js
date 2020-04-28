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
const fs_1 = require("fs");
const open_1 = __importDefault(require("open"));
const path_1 = require("path");
const config_1 = require("./config");
const clickup_1 = require("./clickup");
const gitlab_1 = require("./gitlab");
const inquirer_1 = __importDefault(require("inquirer"));
const dynamic_1 = require("set-interval-async/dynamic");
const actions_1 = require("./actions");
const clipboardy_1 = __importDefault(require("clipboardy"));
const actionAlias = {
    c: 'config',
    st: 'start',
    o: 'open',
    sy: 'sync',
};
const actions = {
    config() {
        return __awaiter(this, void 0, void 0, function* () {
            const configFile = process.argv[3];
            setConfigFile(configFile);
        });
    },
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            const gitLab = new gitlab_1.GitLab(getGitLabProjectId());
            const clickUp = new clickup_1.ClickUp(getClickUpTaskId());
            const answers = yield inquirer_1.default.prompt([
                {
                    name: 'labels',
                    message: 'Choose GitLab Labels to add to new issue',
                    type: 'checkbox',
                    choices: () => gitLab
                        .listProjectLabels()
                        .then((labels) => labels.map((label) => label.name)),
                },
            ]);
            const selectedGitLabLabels = answers.labels;
            const clickUpTask = yield clickUp.getTask();
            const clickUpTaskUrl = clickUpTask['url'];
            const gitLabIssueTitle = process.argv.length >= 6 ? process.argv[5] : clickUpTask['name'];
            yield clickUp.setTaskStatus('in progress');
            const gitLabIssue = yield gitLab.createIssue(gitLabIssueTitle, clickUpTaskUrl, selectedGitLabLabels);
            const gitLabIssueUrl = gitLabIssue.web_url;
            const gitLabIssueNumber = gitLabIssue.iid;
            const gitLabBranch = yield gitLab.createBranch(gitlab_1.getGitLabBranchNameFromIssueNumberAndTitle(gitLabIssueNumber, gitLabIssueTitle));
            yield gitLab.createMergeRequest(gitLabIssueNumber, gitLabIssueTitle, gitLabBranch.name, selectedGitLabLabels);
            console.log(`GitLab Issue Number: ${gitLabIssueNumber}`);
            const dailyProgressString = `${gitLabIssue.title} (#${gitLabIssueNumber}, ${clickUpTaskUrl})`;
            console.log(`Daily Progress string: ${dailyProgressString} (Copied)`);
            clipboardy_1.default.writeSync(dailyProgressString);
            open_1.default(config_1.CONFIG.HackMDNoteUrl);
            open_1.default(clickUpTaskUrl);
            open_1.default(gitLabIssueUrl);
        });
    },
    open() {
        return __awaiter(this, void 0, void 0, function* () {
            const issueNumber = process.argv[4];
            const gitLab = new gitlab_1.GitLab(getGitLabProjectId());
            const answers = yield inquirer_1.default.prompt([
                {
                    name: 'types',
                    message: 'Choose Link Type to open',
                    type: 'checkbox',
                    choices: [
                        { name: 'Issue', value: 'issue' },
                        { name: 'Merge Request', value: 'merge-request' },
                        { name: 'Task', value: 'task' },
                    ],
                },
            ]);
            const issue = yield gitLab.getIssue(issueNumber);
            for (const type of answers.types) {
                switch (type) {
                    case 'issue':
                        open_1.default(issue.web_url);
                        break;
                    case 'merge-request':
                        const mergeRequests = yield gitLab.listMergeRequestsWillCloseIssueOnMerge(issueNumber);
                        open_1.default(mergeRequests[mergeRequests.length - 1].web_url);
                        break;
                    case 'task':
                        const description = issue.description;
                        const result = description.match(/https:\/\/app.clickup.com\/t\/\w+/);
                        if (result) {
                            open_1.default(result[0]);
                        }
                        break;
                }
            }
        });
    },
    sync() {
        return __awaiter(this, void 0, void 0, function* () {
            const gitLabProjectId = getGitLabProjectId();
            const issueNumber = process.argv[4];
            yield actions_1.syncChecklist(gitLabProjectId, issueNumber);
            dynamic_1.setIntervalAsync(() => __awaiter(this, void 0, void 0, function* () {
                yield actions_1.syncChecklist(gitLabProjectId, issueNumber);
            }), 2 * 60 * 1000);
        });
    },
};
(() => __awaiter(void 0, void 0, void 0, function* () {
    const action = actionAlias[process.argv[2]] || process.argv[2];
    if (actions[action]) {
        yield actions[action]();
    }
    else {
        throw Error(`Action ${action} is not supported.`);
    }
}))();
function setConfigFile(configFile) {
    const src = path_1.resolve(configFile);
    const dest = path_1.resolve(__dirname, '../.config.json');
    fs_1.copyFileSync(src, dest);
}
function getGitLabProjectId() {
    return (config_1.CONFIG.GitLabProjectMap[process.argv[3]] || process.argv[3]).replace(/\//g, '%2F');
}
function getClickUpTaskId() {
    return process.argv[4].replace(/#/g, '');
}
