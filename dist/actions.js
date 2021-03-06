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
exports.setUpSyncHotkey = exports.configReadline = exports.syncChecklist = exports.getSyncChecklistActions = void 0;
const open_1 = __importDefault(require("open"));
const readline_1 = __importDefault(require("readline"));
const end_action_1 = require("./actions/end.action");
const clickup_class_1 = require("./classes/clickup.class");
const gitlab_class_1 = require("./classes/gitlab.class");
const utils_1 = require("./utils");
function getSyncChecklistActions(oldClickUpChecklist, newGitLabChecklist) {
    const actions = {
        update: [],
        create: [],
        delete: [],
    };
    const oldLength = oldClickUpChecklist.length;
    const newLength = newGitLabChecklist.length;
    if (newLength < oldLength) {
        actions.delete = oldClickUpChecklist.slice(newLength);
    }
    else if (newLength > oldLength) {
        actions.create = newGitLabChecklist.slice(oldLength);
    }
    const minLength = Math.min(oldLength, newLength);
    for (let i = 0; i < minLength; i++) {
        const oldItem = oldClickUpChecklist[i];
        const newItem = newGitLabChecklist[i];
        if (oldItem.checked !== newItem.checked || oldItem.name !== newItem.name) {
            actions.update.push(Object.assign({ id: oldItem.id }, newItem));
        }
    }
    return actions;
}
exports.getSyncChecklistActions = getSyncChecklistActions;
function syncChecklist(gitLabProjectId, issueNumber, ep, openPage) {
    return __awaiter(this, void 0, void 0, function* () {
        const gitLab = new gitlab_class_1.GitLab(gitLabProjectId);
        const issue = yield gitLab.getIssue(issueNumber);
        const clickUpTaskId = utils_1.getClickUpTaskIdFromGitLabIssue(issue);
        if (clickUpTaskId) {
            const gitLabChecklistText = issue.description
                .replace(/https:\/\/app.clickup.com\/t\/\w+/g, "")
                .trim();
            const gitLabNormalizedChecklist = utils_1.normalizeGitLabIssueChecklist(gitLabChecklistText);
            const clickUp = new clickup_class_1.ClickUp(clickUpTaskId);
            const clickUpTask = yield clickUp.getTask();
            if (openPage) {
                const frameUrls = yield clickUp.getFrameUrls();
                open_1.default(issue.web_url);
                open_1.default(clickUpTask.url);
                if (frameUrls.length) {
                    open_1.default(frameUrls[0]);
                }
            }
            const clickUpChecklistTitle = `GitLab synced checklist [${gitLabProjectId.replace("%2F", "/")}]`;
            let clickUpChecklist = clickUpTask.checklists.find((c) => c.name === clickUpChecklistTitle);
            if (!clickUpChecklist) {
                clickUpChecklist = (yield clickUp.createChecklist(clickUpChecklistTitle))
                    .checklist;
            }
            const clickUpNormalizedChecklist = utils_1.normalizeClickUpChecklist(clickUpChecklist.items);
            const actions = getSyncChecklistActions(clickUpNormalizedChecklist, gitLabNormalizedChecklist);
            const checkedCount = gitLabNormalizedChecklist.filter((item) => item.checked).length;
            const totalCount = gitLabNormalizedChecklist.length;
            ep.setValueAndEndValue(checkedCount, totalCount);
            if (actions.update.length + actions.create.length + actions.delete.length ===
                0) {
                return;
            }
            for (const checklistItem of actions.update) {
                yield clickUp.updateChecklistItem(clickUpChecklist.id, checklistItem.id, checklistItem.name, checklistItem.checked, checklistItem.order);
            }
            for (const checklistItem of actions.create) {
                yield clickUp.createChecklistItem(clickUpChecklist.id, checklistItem.name, checklistItem.checked, checklistItem.order);
            }
            for (const checklistItem of actions.delete) {
                yield clickUp.deleteChecklistItem(clickUpChecklist.id, checklistItem.id);
            }
        }
    });
}
exports.syncChecklist = syncChecklist;
function configReadline() {
    readline_1.default.emitKeypressEvents(process.stdin);
}
exports.configReadline = configReadline;
function setUpSyncHotkey(gitLabProjectId, issueNumber, ep) {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("keypress", (_, key) => __awaiter(this, void 0, void 0, function* () {
        if (key.ctrl && key.name === "c") {
            process.exit();
        }
        else if (!key.ctrl && !key.meta && !key.shift && key.name === "s") {
            console.log(`You pressed the sync key`);
            syncChecklist(gitLabProjectId, issueNumber, ep);
        }
        else if (!key.ctrl && !key.meta && !key.shift && key.name === "e") {
            console.log(`You pressed the end key`);
            yield syncChecklist(gitLabProjectId, issueNumber, ep);
            yield end_action_1.endAction();
            process.exit();
        }
    }));
}
exports.setUpSyncHotkey = setUpSyncHotkey;
