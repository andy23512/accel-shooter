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
const clipboardy_1 = __importDefault(require("clipboardy"));
const date_fns_1 = require("date-fns");
const fs_1 = require("fs");
const inquirer_1 = __importDefault(require("inquirer"));
const open_1 = __importDefault(require("open"));
const os_1 = __importDefault(require("os"));
const path_1 = require("path");
const dynamic_1 = require("set-interval-async/dynamic");
const actions_1 = require("./actions");
const clickup_1 = require("./clickup");
const config_1 = require("./config");
const gitlab_1 = require("./gitlab");
const utils_1 = require("./utils");
const options = {
    endingTodo: `

- [ ] ending
  - [ ] check functionality
  - [ ] frontend
    - [ ] check tooltip
    - [ ] check overflow content handling
    - [ ] check overflow item handling
    - [ ] check number pipe
    - [ ] check lint
    - [ ] check test
    - [ ] check prod
    - [ ] check lint after fix test and prod
    - [ ] check console.log
    - [ ] check i18n
  - [ ] backend
    - [ ] check api need pagination or not
    - [ ] check test
    - [ ] check print
    - [ ] check key error
    - [ ] handle single file or single folder import in import command
  - [ ] check conflict
  - [ ] review code
  - [ ] check if any not-pushed code exists
  - [ ] mark MR as resolved
  - [ ] assign MR
  - [ ] change ClickUp task status`,
};
const actionAlias = {
    c: 'config',
    st: 'start',
    o: 'open',
    sy: 'sync',
    cp: 'copy',
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
            actions_1.configReadline();
            const answers = yield inquirer_1.default.prompt([
                {
                    name: 'gitLabProject',
                    message: 'Choose GitLab Project',
                    type: 'list',
                    choices: config_1.CONFIG.GitLabProjects.map((p) => ({
                        name: `${p.name} (${p.repo})`,
                        value: p,
                    })),
                },
                {
                    name: 'clickUpTaskId',
                    message: 'Enter ClickUp Task ID',
                    type: 'input',
                    filter: (input) => input.replace('#', ''),
                },
                {
                    name: 'issueTitle',
                    message: 'Enter Issue Title',
                    type: 'input',
                    default: (answers) => __awaiter(this, void 0, void 0, function* () {
                        let task = yield new clickup_1.ClickUp(answers.clickUpTaskId).getTask();
                        let result = task.name;
                        while (task.parent) {
                            task = yield new clickup_1.ClickUp(task.parent).getTask();
                            result = `${task.name} - ${result}`;
                        }
                        return result;
                    }),
                },
                {
                    name: 'labels',
                    message: 'Choose GitLab Labels to add to new Issue',
                    type: 'checkbox',
                    choices: ({ gitLabProject }) => __awaiter(this, void 0, void 0, function* () {
                        return new gitlab_1.GitLab(gitLabProject.id)
                            .listProjectLabels()
                            .then((labels) => labels.map((label) => label.name));
                    }),
                },
            ]);
            const gitLab = new gitlab_1.GitLab(answers.gitLabProject.id);
            const clickUp = new clickup_1.ClickUp(answers.clickUpTaskId);
            const selectedGitLabLabels = answers.labels;
            const clickUpTask = yield clickUp.getTask();
            const clickUpTaskUrl = clickUpTask['url'];
            const gitLabIssueTitle = answers.issueTitle;
            yield clickUp.setTaskStatus('in progress');
            const gitLabIssue = yield gitLab.createIssue(gitLabIssueTitle, `${clickUpTaskUrl}${options.endingTodo}`, selectedGitLabLabels);
            const gitLabIssueUrl = gitLabIssue.web_url;
            const gitLabIssueNumber = gitLabIssue.iid;
            const gitLabBranch = yield gitLab.createBranch(gitlab_1.getGitLabBranchNameFromIssueNumberAndTitleAndTaskId(gitLabIssueNumber, gitLabIssueTitle, answers.clickUpTaskId));
            yield gitLab.createMergeRequest(gitLabIssueNumber, gitLabIssueTitle, gitLabBranch.name, selectedGitLabLabels);
            process.chdir(answers.gitLabProject.path.replace('~', os_1.default.homedir()));
            yield utils_1.promiseSpawn('git', ['fetch']);
            yield sleep(1000);
            yield utils_1.promiseSpawn('git', ['checkout', gitLabBranch.name]);
            const dailyProgressString = `* (Processing) ${gitLabIssue.title} (#${gitLabIssueNumber}, ${clickUpTaskUrl})`;
            const homedir = os_1.default.homedir();
            const dpPath = path_1.join(homedir, 'ResilioSync/Daily Progress.md');
            const dpContent = fs_1.readFileSync(dpPath, { encoding: 'utf-8' });
            const updatedDpContent = dpContent.replace('## Buffer', `## Buffer\n    ${dailyProgressString}`);
            fs_1.writeFileSync(dpPath, updatedDpContent);
            open_1.default(gitLabIssueUrl);
            const syncCommand = `acst sync ${answers.gitLabProject.name} ${gitLabIssueNumber}`;
            clipboardy_1.default.writeSync(syncCommand);
            console.log(`Sync command: "${syncCommand}" Copied!`);
        });
    },
    open() {
        return __awaiter(this, void 0, void 0, function* () {
            const issueNumber = process.argv[4];
            const gitLab = new gitlab_1.GitLab(getGitLabProjectIdFromArgv());
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
            actions_1.configReadline();
            const gitLabProjectId = getGitLabProjectIdFromArgv();
            const issueNumber = process.argv[4];
            actions_1.setUpSyncHotkey(gitLabProjectId, issueNumber);
            yield actions_1.syncChecklist(gitLabProjectId, issueNumber, true);
            dynamic_1.setIntervalAsync(() => __awaiter(this, void 0, void 0, function* () {
                yield actions_1.syncChecklist(gitLabProjectId, issueNumber);
            }), 5 * 60 * 1000);
        });
    },
    copy() {
        return __awaiter(this, void 0, void 0, function* () {
            const day = process.argv.length >= 4
                ? process.argv[3]
                : date_fns_1.format(new Date(), 'yyyy/MM/dd');
            const homedir = os_1.default.homedir();
            const dpPath = path_1.join(homedir, 'ResilioSync/Daily Progress.md');
            const dpContent = fs_1.readFileSync(dpPath, { encoding: 'utf-8' });
            const matchResult = dpContent.match(new RegExp(`(### ${day}.*?)\n###`, 's'));
            if (matchResult) {
                const record = matchResult[1];
                if (/2\. Today\n3\./.test(record)) {
                    console.log('Today content is empty.');
                }
                else {
                    clipboardy_1.default.writeSync(record);
                    console.log(record);
                    console.log('Copied!');
                }
            }
            else {
                console.log('DP record does not exist.');
            }
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
function getGitLabProjectByName(n) {
    return config_1.CONFIG.GitLabProjects.find(({ name }) => name === n);
}
function getGitLabProjectIdByName(name) {
    var _a;
    const gitLabProjectId = (_a = getGitLabProjectByName(name)) === null || _a === void 0 ? void 0 : _a.id;
    if (!gitLabProjectId) {
        throw new Error('Cannot find project');
    }
    return gitLabProjectId;
}
function getGitLabProjectIdFromArgv() {
    return getGitLabProjectIdByName(process.argv[3]);
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
