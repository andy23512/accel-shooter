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
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
const clipboardy_1 = __importDefault(require("clipboardy"));
const date_fns_1 = require("date-fns");
const fs_1 = require("fs");
const inquirer_1 = __importDefault(require("inquirer"));
const moment_1 = __importDefault(require("moment"));
const mustache_1 = require("mustache");
const open_1 = __importDefault(require("open"));
const os_1 = __importDefault(require("os"));
const dynamic_1 = require("set-interval-async/dynamic");
const table_1 = require("table");
const untildify_1 = __importDefault(require("untildify"));
const actions_1 = require("./actions");
const checker_1 = require("./checker");
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
    ls: "list",
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
            const dailyProgressString = `* (In Progress) ${gitLabIssue.title} (${answers.gitLabProject.name} ${gitLabIssueNumber}, ${clickUpTaskUrl})`;
            new daily_progress_1.DailyProgress().addProgressToBuffer(dailyProgressString);
            p.next();
            const syncCommand = `acst sync ${answers.gitLabProject.name} ${gitLabIssueNumber}`;
            clipboardy_1.default.writeSync(syncCommand);
            p.next();
            new tracker_1.Tracker().addItem(answers.gitLabProject.name, gitLabIssueNumber);
            p.next();
            process.chdir(answers.gitLabProject.path.replace("~", os_1.default.homedir()));
            yield utils_1.promiseSpawn("git", ["fetch"], "pipe");
            yield sleep(1000);
            yield utils_1.promiseSpawn("git", ["checkout", gitLabBranch.name], "pipe");
            yield utils_1.promiseSpawn("git", ["submodule", "update", "--init", "--recursive"], "pipe");
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
            const { gitLabProject, issueNumber } = getGitLabProjectAndIssueNumber();
            const gitLabProjectId = gitLabProject.id;
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
            const { gitLabProject, issueNumber } = getGitLabProjectAndIssueNumber();
            const checker = new checker_1.Checker(gitLabProject, issueNumber);
            yield checker.start();
        });
    },
    comment() {
        return __awaiter(this, void 0, void 0, function* () {
            const answers = yield inquirer_1.default.prompt([
                {
                    name: "content",
                    message: "Enter comment content",
                    type: "editor",
                },
            ]);
            const { gitLabProject, issueNumber } = getGitLabProjectAndIssueNumber();
            const gitLab = new gitlab_1.GitLab(gitLabProject.id);
            const mergeRequests = yield gitLab.listMergeRequestsWillCloseIssueOnMerge(issueNumber);
            const mergeRequest = mergeRequests[mergeRequests.length - 1];
            yield gitLab.createMergeRequestNote(mergeRequest, answers.content);
        });
    },
    myTasks() {
        return __awaiter(this, void 0, void 0, function* () {
            const user = (yield clickup_1.ClickUp.getCurrentUser()).user;
            const team = (yield clickup_1.ClickUp.getTeams()).teams.find((t) => t.name === config_1.CONFIG.ClickUpTeam);
            if (!team) {
                console.log("Team does not exist.");
                return;
            }
            const tasks = (yield clickup_1.ClickUp.getMyTasks(team.id, user.id)).tasks;
            const summarizedTasks = [];
            for (const task of tasks) {
                const taskPath = [task];
                let t = task;
                while (t.parent) {
                    t = yield new clickup_1.ClickUp(task.parent).getTask();
                    taskPath.push(t);
                }
                const simpleTaskPath = taskPath.map((t) => ({
                    name: t.name,
                    id: t.id,
                    priority: t.priority,
                    due_date: t.due_date,
                }));
                const reducedTask = simpleTaskPath.reduce((a, c) => ({
                    name: a.name,
                    id: a.id,
                    priority: (a.priority === null && c.priority !== null) ||
                        (a.priority !== null &&
                            c.priority !== null &&
                            parseInt(a.priority.orderindex) > parseInt(c.priority.orderindex))
                        ? c.priority
                        : a.priority,
                    due_date: (a.due_date === null && c.due_date !== null) ||
                        (a.due_date !== null &&
                            c.due_date !== null &&
                            parseInt(a.due_date) > parseInt(c.due_date))
                        ? c.due_date
                        : a.due_date,
                }));
                summarizedTasks.push({
                    name: task.name,
                    id: task.id,
                    priority: reducedTask.priority,
                    due_date: reducedTask.due_date,
                    original_priority: task.priority,
                    original_due_date: task.due_date,
                });
            }
            const compare = (a, b) => {
                if (a === b) {
                    return 0;
                }
                else if (a === null || typeof a === "undefined") {
                    return 1;
                }
                else if (b === null || typeof b === "undefined") {
                    return -1;
                }
                return parseInt(a) - parseInt(b);
            };
            const colorPriority = (priority) => {
                switch (priority) {
                    case "urgent":
                        return chalk_1.default.redBright(priority);
                    case "high":
                        return chalk_1.default.yellowBright(priority);
                    case "normal":
                        return chalk_1.default.cyanBright(priority);
                    default:
                        return chalk_1.default.white(priority);
                }
            };
            const topDueDateTasks = summarizedTasks
                .filter((t) => t.due_date)
                .sort((a, b) => {
                var _a, _b;
                return (compare(a.due_date, b.due_date) ||
                    compare((_a = a.priority) === null || _a === void 0 ? void 0 : _a.orderindex, (_b = b.priority) === null || _b === void 0 ? void 0 : _b.orderindex));
            });
            console.log("Sort by Due Date:");
            console.log(table_1.table(topDueDateTasks.map((t) => {
                var _a;
                return [
                    t.name,
                    colorPriority((_a = t.priority) === null || _a === void 0 ? void 0 : _a.priority),
                    moment_1.default(+t.due_date).format("YYYY-MM-DD"),
                ];
            })));
            const topPriorityTasks = summarizedTasks
                .filter((t) => t.priority)
                .sort((a, b) => {
                var _a, _b;
                return (compare((_a = a.priority) === null || _a === void 0 ? void 0 : _a.orderindex, (_b = b.priority) === null || _b === void 0 ? void 0 : _b.orderindex) ||
                    compare(a.due_date, b.due_date));
            });
            console.log("Sort by Priority:");
            console.log(table_1.table(topPriorityTasks.map((t) => {
                var _a;
                return [
                    t.name,
                    colorPriority((_a = t.priority) === null || _a === void 0 ? void 0 : _a.priority),
                    t.due_date ? moment_1.default(+t.due_date).format("YYYY-MM-DD") : "",
                ];
            })));
        });
    },
    list() {
        return __awaiter(this, void 0, void 0, function* () {
            const { gitLabProject, issueNumber } = getGitLabProjectAndIssueNumber();
            const gitLab = new gitlab_1.GitLab(gitLabProject.id);
            const issue = yield gitLab.getIssue(issueNumber);
            console.log(issue.title);
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
function getGitLabProjectAndIssueNumber() {
    if (process.argv.length === 3) {
        const directory = child_process_1.execSync("pwd", { encoding: "utf-8" });
        const gitLabProject = config_1.CONFIG.GitLabProjects.find((p) => directory.startsWith(p.path));
        if (!gitLabProject) {
            throw Error("No such project");
        }
        const branchName = child_process_1.execSync("git branch --show-current", {
            encoding: "utf-8",
        });
        const match = branchName.match(/^[0-9]+/);
        if (!match) {
            throw Error("Cannot get issue number from branch");
        }
        const issueNumber = match[0];
        return { gitLabProject, issueNumber };
    }
    else {
        const gitLabProject = getGitLabProjectFromArgv();
        if (!gitLabProject) {
            throw Error("No such project");
        }
        return { gitLabProject, issueNumber: process.argv[4] };
    }
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
