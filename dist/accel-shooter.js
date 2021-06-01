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
const mustache_1 = require("mustache");
const open_1 = __importDefault(require("open"));
const os_1 = __importDefault(require("os"));
const path_1 = require("path");
const dynamic_1 = require("set-interval-async/dynamic");
const untildify_1 = __importDefault(require("untildify"));
const actions_1 = require("./actions");
const clickup_1 = require("./clickup");
const config_1 = require("./config");
const daily_progress_1 = require("./daily-progress");
const emoji_progress_1 = require("./emoji-progress");
const gitlab_1 = require("./gitlab");
const progress_log_1 = require("./progress-log");
const tracker_1 = require("./tracker");
const utils_1 = require("./utils");
const actionAlias = {
    st: "start",
    o: "open",
    sy: "sync",
    c: "copy",
    t: "track",
    e: "end",
    re: "revertEnd",
};
const actions = {
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            actions_1.configReadline();
            const answers = yield inquirer_1.default.prompt([
                {
                    name: "gitLabProject",
                    message: "Choose GitLab Project",
                    type: "list",
                    choices: config_1.CONFIG.GitLabProjects.map((p) => ({
                        name: `${p.name} (${p.repo})`,
                        value: p,
                    })),
                },
                {
                    name: "clickUpTaskId",
                    message: "Enter ClickUp Task ID",
                    type: "input",
                    filter: (input) => input.replace("#", ""),
                },
                {
                    name: "issueTitle",
                    message: "Enter Issue Title",
                    type: "input",
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
                    name: "todoConfig",
                    message: "Choose Preset To-do Config",
                    type: "checkbox",
                    choices: config_1.CONFIG.ToDoConfigChoices,
                },
            ]);
            const p = new progress_log_1.CustomProgressLog("Start", [
                "Get ClickUp Task",
                "Set ClickUp Task Status",
                "Render Todo List",
                "Create GitLab Issue",
                "Create GitLab Branch",
                "Create GitLab Merge Request",
                "Add Daily Progress Entry",
                "Copy Sync Command",
                "Add Tracker Item",
                "Do Git Fetch and Checkout",
            ]);
            const gitLab = new gitlab_1.GitLab(answers.gitLabProject.id);
            const clickUp = new clickup_1.ClickUp(answers.clickUpTaskId);
            p.start();
            const clickUpTask = yield clickUp.getTask();
            const clickUpTaskUrl = clickUpTask["url"];
            const gitLabIssueTitle = answers.issueTitle;
            p.next();
            yield clickUp.setTaskStatus("in progress");
            p.next();
            const todoConfigMap = {};
            answers.todoConfig.forEach((c) => {
                todoConfigMap[c] = true;
            });
            const template = fs_1.readFileSync(untildify_1.default(config_1.CONFIG.ToDoTemplate), {
                encoding: "utf-8",
            });
            const endingTodo = mustache_1.render(template, todoConfigMap);
            p.next();
            const gitLabIssue = yield gitLab.createIssue(gitLabIssueTitle, `${clickUpTaskUrl}\n\n${endingTodo}`);
            const gitLabIssueNumber = gitLabIssue.iid;
            p.next();
            const gitLabBranch = yield gitLab.createBranch(gitlab_1.getGitLabBranchNameFromIssueNumberAndTitleAndTaskId(gitLabIssueNumber, answers.clickUpTaskId));
            p.next();
            yield gitLab.createMergeRequest(gitLabIssueNumber, gitLabIssueTitle, gitLabBranch.name);
            p.next();
            const dailyProgressString = `* (In Progress) ${gitLabIssue.title} (#${gitLabIssueNumber}, ${clickUpTaskUrl})`;
            new daily_progress_1.DailyProgress().addProgressToBuffer(dailyProgressString);
            p.next();
            const syncCommand = `acst sync ${answers.gitLabProject.name} ${gitLabIssueNumber}`;
            clipboardy_1.default.writeSync(syncCommand);
            console.log(`Sync command: "${syncCommand}" Copied!`);
            p.next();
            new tracker_1.Tracker().addItem(answers.gitLabProject.name, gitLabIssueNumber);
            p.next();
            process.chdir(answers.gitLabProject.path.replace("~", os_1.default.homedir()));
            yield utils_1.promiseSpawn("git", ["fetch"]);
            yield sleep(1000);
            yield utils_1.promiseSpawn("git", ["checkout", gitLabBranch.name]);
            p.end(0);
        });
    },
    open() {
        return __awaiter(this, void 0, void 0, function* () {
            const issueNumber = process.argv[4];
            const gitLab = new gitlab_1.GitLab(getGitLabProjectIdFromArgv());
            const answers = yield inquirer_1.default.prompt([
                {
                    name: "types",
                    message: "Choose Link Type to open",
                    type: "checkbox",
                    choices: [
                        { name: "Issue", value: "issue" },
                        { name: "Merge Request", value: "merge-request" },
                        { name: "Task", value: "task" },
                    ],
                },
            ]);
            const issue = yield gitLab.getIssue(issueNumber);
            for (const type of answers.types) {
                switch (type) {
                    case "issue":
                        open_1.default(issue.web_url);
                        break;
                    case "merge-request":
                        const mergeRequests = yield gitLab.listMergeRequestsWillCloseIssueOnMerge(issueNumber);
                        open_1.default(mergeRequests[mergeRequests.length - 1].web_url);
                        break;
                    case "task":
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
            const gitLabProject = getGitLabProjectFromArgv();
            if (!gitLabProject) {
                return;
            }
            const gitLabProjectId = gitLabProject.id;
            const issueNumber = process.argv[4];
            const gitLab = new gitlab_1.GitLab(gitLabProject.id);
            const mergeRequests = yield gitLab.listMergeRequestsWillCloseIssueOnMerge(issueNumber);
            const lastMergeRequest = mergeRequests[mergeRequests.length - 1];
            process.chdir(gitLabProject.path.replace("~", os_1.default.homedir()));
            yield utils_1.promiseSpawn("git", ["checkout", lastMergeRequest.source_branch], "pipe");
            const ep = new emoji_progress_1.CustomEmojiProgress(0, 100);
            actions_1.setUpSyncHotkey(gitLabProjectId, issueNumber, ep);
            yield actions_1.syncChecklist(gitLabProjectId, issueNumber, ep, true);
            dynamic_1.setIntervalAsync(() => __awaiter(this, void 0, void 0, function* () {
                yield actions_1.syncChecklist(gitLabProjectId, issueNumber, ep, false);
            }), config_1.CONFIG.SyncIntervalInMinutes * 60 * 1000);
        });
    },
    copy() {
        return __awaiter(this, void 0, void 0, function* () {
            const day = process.argv.length >= 4
                ? process.argv[3]
                : date_fns_1.format(new Date(), "yyyy/MM/dd");
            const dp = new daily_progress_1.DailyProgress();
            const record = dp.getRecordByDay(day);
            if (record) {
                const newDpRecord = yield utils_1.updateTaskStatusInDp(record);
                dp.writeRecordByDay(day, newDpRecord);
                clipboardy_1.default.writeSync(newDpRecord);
                console.log(newDpRecord);
                console.log("Copied!");
            }
        });
    },
    track() {
        return __awaiter(this, void 0, void 0, function* () {
            const tracker = new tracker_1.Tracker();
            tracker.startSync();
        });
    },
    end() {
        return __awaiter(this, void 0, void 0, function* () {
            const gitLabProjectId = getGitLabProjectIdFromArgv();
            const issueNumber = process.argv[4];
            const gitLab = new gitlab_1.GitLab(gitLabProjectId);
            const p = new progress_log_1.CustomProgressLog("End", [
                "Get GitLab Issue",
                "Get GitLab Merge Request",
                "Update GitLab Merge Request Ready Status and Assignee",
                "Update ClickUp Task Status",
            ]);
            p.start();
            const issue = yield gitLab.getIssue(issueNumber);
            const gitLabChecklistText = issue.description
                .replace(/https:\/\/app.clickup.com\/t\/\w+/g, "")
                .trim();
            const gitLabNormalizedChecklist = utils_1.normalizeGitLabIssueChecklist(gitLabChecklistText);
            const fullCompleted = gitLabNormalizedChecklist.every((item) => item.checked);
            if (!fullCompleted) {
                console.log("This task has uncompleted todo(s).");
                return;
            }
            p.next();
            const mergeRequests = yield gitLab.listMergeRequestsWillCloseIssueOnMerge(issueNumber);
            const mergeRequest = mergeRequests[mergeRequests.length - 1];
            p.next();
            yield gitLab.markMergeRequestAsReadyAndAddAssignee(mergeRequest);
            p.next();
            const clickUpTaskId = utils_1.getClickUpTaskIdFromGitLabIssue(issue);
            if (clickUpTaskId) {
                const clickUp = new clickup_1.ClickUp(clickUpTaskId);
                yield clickUp.setTaskStatus("in review");
            }
            p.end(0);
        });
    },
    revertEnd() {
        return __awaiter(this, void 0, void 0, function* () {
            const gitLabProjectId = getGitLabProjectIdFromArgv();
            const issueNumber = process.argv[4];
            const gitLab = new gitlab_1.GitLab(gitLabProjectId);
            const p = new progress_log_1.CustomProgressLog("End", [
                "Get GitLab Issue",
                "Get GitLab Merge Request",
                "Update GitLab Merge Request Ready Status and Assignee",
                "Update ClickUp Task Status",
            ]);
            p.start();
            const issue = yield gitLab.getIssue(issueNumber);
            p.next();
            const mergeRequests = yield gitLab.listMergeRequestsWillCloseIssueOnMerge(issueNumber);
            const mergeRequest = mergeRequests[mergeRequests.length - 1];
            p.next();
            yield gitLab.markMergeRequestAsUnreadyAndSetAssigneeToSelf(mergeRequest);
            p.next();
            const clickUpTaskId = utils_1.getClickUpTaskIdFromGitLabIssue(issue);
            if (clickUpTaskId) {
                const clickUp = new clickup_1.ClickUp(clickUpTaskId);
                yield clickUp.setTaskStatus("in progress");
            }
            p.end(0);
        });
    },
    crossChecklist() {
        return __awaiter(this, void 0, void 0, function* () {
            const answers = yield inquirer_1.default.prompt([
                {
                    name: "initialSpaces",
                    message: "Enter prefix spaces",
                    type: "input",
                },
                {
                    name: "firstLevel",
                    message: "Enter first level items",
                    type: "editor",
                },
                {
                    name: "secondLevel",
                    message: "Enter second level items",
                    type: "editor",
                    default: config_1.CONFIG.CrossChecklistDefaultSecondLevel.join("\n"),
                },
            ]);
            const firstLevelItems = answers.firstLevel
                .split("\n")
                .filter(Boolean);
            const secondLevelItems = answers.secondLevel
                .split("\n")
                .filter(Boolean);
            const result = firstLevelItems
                .map((e) => answers.initialSpaces +
                "  - [ ] " +
                e +
                "\n" +
                secondLevelItems
                    .map((f) => `${answers.initialSpaces}    - [ ] ${f}`)
                    .join("\n"))
                .join("\n");
            clipboardy_1.default.writeSync(result);
            console.log(result);
            console.log("Copied!");
        });
    },
    RTVTasks() {
        return __awaiter(this, void 0, void 0, function* () {
            const user = (yield clickup_1.ClickUp.getCurrentUser()).user;
            const team = (yield clickup_1.ClickUp.getTeams()).teams.find((t) => t.name === config_1.CONFIG.ClickUpTeam);
            if (!team) {
                console.log("Team does not exist.");
                return;
            }
            const tasks = (yield clickup_1.ClickUp.getRTVTasks(team.id, user.id)).tasks;
            console.log(tasks.map((t) => `- ${t.name} (${t.url})`).join("\n"));
        });
    },
    check() {
        return __awaiter(this, void 0, void 0, function* () {
            let p;
            let result;
            const gitLabProject = getGitLabProjectFromArgv();
            if (!gitLabProject) {
                return;
            }
            const gitLabProjectId = gitLabProject.id;
            const issueNumber = process.argv[4];
            const gitLab = new gitlab_1.GitLab(gitLabProjectId);
            const mergeRequests = yield gitLab.listMergeRequestsWillCloseIssueOnMerge(issueNumber);
            const mergeRequest = mergeRequests[mergeRequests.length - 1];
            const mergeRequestChanges = yield gitLab.getMergeRequestChanges(mergeRequest.iid);
            process.chdir(gitLabProject.path.replace("~", os_1.default.homedir()));
            yield utils_1.promiseSpawn("git", ["checkout", mergeRequest.source_branch]);
            p = new progress_log_1.CustomProgressLog("Global", [
                "Check Non-Pushed Changes",
                "Check Conflict",
            ]);
            p.start();
            result = yield utils_1.promiseSpawn("git", ["status"], "pipe");
            result.code =
                result.stdout.includes("Your branch is up to date with") &&
                    result.stdout.includes("nothing to commit, working tree clean")
                    ? 0
                    : 1;
            p.next(result.code);
            const fullMergeRequest = yield gitLab.getMergeRequest(mergeRequest.iid);
            const isConflict = fullMergeRequest.has_conflicts;
            p.next(isConflict ? 1 : 0);
            const changes = mergeRequestChanges.changes;
            const frontendChanges = changes.filter((c) => c.old_path.startsWith("frontend") || c.new_path.startsWith("frontend"));
            const backendChanges = changes.filter((c) => c.old_path.startsWith("backend") || c.new_path.startsWith("backend"));
            if (frontendChanges.length) {
                p = new progress_log_1.CustomProgressLog("Frontend", [
                    "lint",
                    "test",
                    "prod",
                    "check console.log",
                    "check long import",
                ]);
                process.chdir(path_1.join(gitLabProject.path).replace("~", os_1.default.homedir()));
                p.start();
                result = yield utils_1.promiseSpawn("yarn", ["lint"], "pipe");
                p.next(result.code);
                result = yield utils_1.promiseSpawn("docker-compose", ["exec", "frontend", "yarn", "jest", "--coverage=false"], "pipe");
                p.next(result.code);
                yield utils_1.promiseSpawn("docker-compose", ["exec", "frontend", "yarn", "prod"], "pipe");
                p.next(result.code);
                const hasConsole = frontendChanges.some((c) => c.diff.includes("console.log"))
                    ? 1
                    : 0;
                p.next(hasConsole);
                const hasLong = frontendChanges.some((c) => c.diff.includes("../../"))
                    ? 1
                    : 0;
                p.next(hasLong);
            }
            if (backendChanges.length) {
                process.chdir(path_1.join(gitLabProject.path).replace("~", os_1.default.homedir()));
                p = new progress_log_1.CustomProgressLog("Backend", ["test", "check print"]);
                p.start();
                result = yield utils_1.promiseSpawn("docker-compose", ["exec", "-T", "backend", "pytest", "."], "pipe");
                p.next(result.code);
                const hasPrint = backendChanges.some((c) => c.diff.includes("print("))
                    ? 1
                    : 0;
                p.next(hasPrint);
            }
        });
    },
};
(() => __awaiter(void 0, void 0, void 0, function* () {
    const action = actionAlias[process.argv[2]] || process.argv[2];
    if (actions[action]) {
        yield actions[action]();
    }
    else if (config_1.CONFIG.WebPageAlias[action]) {
        open_1.default(config_1.CONFIG.WebPageAlias[action]);
    }
    else {
        throw Error(`Action ${action} is not supported.`);
    }
}))();
function getGitLabProjectIdByName(name) {
    var _a;
    const gitLabProjectId = (_a = utils_1.getGitLabProjectConfigByName(name)) === null || _a === void 0 ? void 0 : _a.id;
    if (!gitLabProjectId) {
        throw new Error("Cannot find project");
    }
    return gitLabProjectId;
}
function getGitLabProjectIdFromArgv() {
    return getGitLabProjectIdByName(process.argv[3]);
}
function getGitLabProjectFromArgv() {
    return utils_1.getGitLabProjectConfigByName(process.argv[3]);
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
