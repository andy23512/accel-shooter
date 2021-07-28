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
exports.startAction = void 0;
const clipboardy_1 = __importDefault(require("clipboardy"));
const fs_1 = require("fs");
const inquirer_1 = __importDefault(require("inquirer"));
const mustache_1 = require("mustache");
const os_1 = __importDefault(require("os"));
const untildify_1 = __importDefault(require("untildify"));
const clickup_class_1 = require("../classes/clickup.class");
const daily_progress_class_1 = require("../classes/daily-progress.class");
const gitlab_class_1 = require("../classes/gitlab.class");
const progress_log_class_1 = require("../classes/progress-log.class");
const tracker_class_1 = require("../classes/tracker.class");
const config_1 = require("../config");
const sleep_utils_1 = require("../sleep.utils");
const utils_1 = require("../utils");
const sync_action_1 = require("./sync.action");
function startAction() {
    return __awaiter(this, void 0, void 0, function* () {
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
                    let task = yield new clickup_class_1.ClickUp(answers.clickUpTaskId).getTask();
                    let result = task.name;
                    while (task.parent) {
                        task = yield new clickup_class_1.ClickUp(task.parent).getTask();
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
        const p = new progress_log_class_1.CustomProgressLog("Start", [
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
        process.chdir(answers.gitLabProject.path.replace("~", os_1.default.homedir()));
        yield utils_1.checkWorkingTreeClean();
        const gitLab = new gitlab_class_1.GitLab(answers.gitLabProject.id);
        const clickUp = new clickup_class_1.ClickUp(answers.clickUpTaskId);
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
        todoConfigMap[answers.gitLabProject.name] = true;
        const template = fs_1.readFileSync(untildify_1.default(config_1.CONFIG.ToDoTemplate), {
            encoding: "utf-8",
        });
        const endingTodo = mustache_1.render(template, todoConfigMap);
        p.next();
        const gitLabIssue = yield gitLab.createIssue(gitLabIssueTitle, `${clickUpTaskUrl}\n\n${endingTodo}`);
        const gitLabIssueNumber = gitLabIssue.iid;
        p.next();
        const gitLabBranch = yield gitLab.createBranch(utils_1.getGitLabBranchNameFromIssueNumberAndTitleAndTaskId(gitLabIssueNumber, answers.clickUpTaskId));
        p.next();
        yield gitLab.createMergeRequest(gitLabIssueNumber, gitLabIssueTitle, gitLabBranch.name);
        p.next();
        const dailyProgressString = `* (In Progress) ${gitLabIssue.title} (${answers.gitLabProject.name} ${gitLabIssueNumber}, ${clickUpTaskUrl})`;
        new daily_progress_class_1.DailyProgress().addProgressToBuffer(dailyProgressString);
        p.next();
        const syncCommand = `acst sync ${answers.gitLabProject.name} ${gitLabIssueNumber}`;
        clipboardy_1.default.writeSync(syncCommand);
        p.next();
        new tracker_class_1.Tracker().addItem(answers.gitLabProject.name, gitLabIssueNumber);
        p.next();
        process.chdir(answers.gitLabProject.path.replace("~", os_1.default.homedir()));
        yield utils_1.promiseSpawn("git", ["fetch"], "pipe");
        yield sleep_utils_1.sleep(1000);
        yield utils_1.promiseSpawn("git", ["checkout", gitLabBranch.name], "pipe");
        yield utils_1.promiseSpawn("git", ["submodule", "update", "--init", "--recursive"], "pipe");
        p.end(0);
        yield sync_action_1.syncAction();
    });
}
exports.startAction = startAction;
