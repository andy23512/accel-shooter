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
Object.defineProperty(exports, "__esModule", { value: true });
const gitlab_1 = require("./gitlab");
const utils_1 = require("./utils");
const clickup_1 = require("./clickup");
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
function syncChecklist(gitLabProjectId, issueNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        const gitLab = new gitlab_1.GitLab(gitLabProjectId);
        const issue = yield gitLab.getIssue(issueNumber);
        const issueDescription = issue.description;
        const result = issueDescription.match(/https:\/\/app.clickup.com\/t\/(\w+)/);
        if (result) {
            const clickUpTaskId = result[1];
            const gitLabChecklistText = issueDescription
                .replace(/https:\/\/app.clickup.com\/t\/\w+/g, '')
                .trim();
            const gitLabNormalizedChecklist = utils_1.normalizeGitLabIssueChecklist(gitLabChecklistText);
            const clickUp = new clickup_1.ClickUp(clickUpTaskId);
            const clickUpTasks = yield clickUp.getTask();
            let clickUpChecklist = clickUpTasks.checklists.find((c) => c.name === 'GitLab synced checklist');
            if (!clickUpChecklist) {
                clickUpChecklist = (yield clickUp.createChecklist('GitLab synced checklist')).checklist;
            }
            const clickUpNormalizedChecklist = utils_1.normalizeClickUpChecklist(clickUpChecklist.items);
            const actions = getSyncChecklistActions(clickUpNormalizedChecklist, gitLabNormalizedChecklist);
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
            const status = Object.entries(actions)
                .map(([action, items]) => {
                const s = items.length.toString();
                const n = items.length === 1 ? 'item' : 'items';
                return `${s} ${n} ${action}d`;
            })
                .join(', ');
            console.log(`[${gitLabProjectId.replace('%2F', '/')} #${issueNumber}] ${new Date().toLocaleString()} ${status}`);
        }
    });
}
exports.syncChecklist = syncChecklist;
