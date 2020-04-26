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
const node_fetch_1 = __importDefault(require("node-fetch"));
const config_1 = require("./config");
const gitlab_1 = require("./gitlab");
const clickup_1 = require("./clickup");
function checkStatus(res) {
    if (res.ok) {
        return res;
    }
    else {
        throw Error(res.statusText);
    }
}
function callApiFactory(site) {
    let apiUrl = '';
    let headers = {};
    switch (site) {
        case 'GitLab':
            apiUrl = 'https://gitlab.com/api/v4';
            headers = { 'Private-Token': config_1.CONFIG.GitLabToken };
            break;
        case 'ClickUp':
            apiUrl = 'https://api.clickup.com/api/v2';
            headers = { Authorization: config_1.CONFIG.ClickUpToken };
            break;
        default:
            throw Error(`Site {site} is not supported.`);
    }
    return (method, url, body) => __awaiter(this, void 0, void 0, function* () {
        const params = new URLSearchParams();
        if (body) {
            Object.entries(body).forEach(([key, value]) => {
                params.set(key, value);
            });
        }
        return node_fetch_1.default(apiUrl + url, method === 'get'
            ? {
                method,
                headers,
            }
            : { method, headers, body: params })
            .then(checkStatus)
            .then((res) => res.json());
    });
}
exports.callApiFactory = callApiFactory;
function dashify(input) {
    let temp = input
        .replace(/[^A-Za-z0-9]/g, '-')
        .replace(/-{2,}/g, '-')
        .toLowerCase();
    if (temp.length >= 100) {
        temp = temp.substring(0, 100);
        return temp.substring(0, temp.lastIndexOf('-'));
    }
    return temp;
}
exports.dashify = dashify;
function normalizeGitLabIssueChecklist(checklistText) {
    return checklistText.split('\n').map((line, index) => ({
        name: line
            .replace(/- \[[x ]\] /g, '')
            .replace(/^ +/, (space) => space.replace(/ /g, '-')),
        checked: /- \[x\]/.test(line),
        order: index,
    }));
}
exports.normalizeGitLabIssueChecklist = normalizeGitLabIssueChecklist;
function normalizeClickUpChecklist(checklist) {
    return checklist
        .sort((a, b) => a.orderindex - b.orderindex)
        .map((item, index) => ({
        name: item.name,
        checked: item.resolved,
        order: index,
        id: item.id,
    }));
}
exports.normalizeClickUpChecklist = normalizeClickUpChecklist;
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
            const gitLabNormalizedChecklist = normalizeGitLabIssueChecklist(gitLabChecklistText);
            const clickUp = new clickup_1.ClickUp(clickUpTaskId);
            const clickUpTasks = yield clickUp.getTask();
            let clickUpChecklist = clickUpTasks.checklists.find((c) => c.name === 'GitLab synced checklist');
            if (!clickUpChecklist) {
                clickUpChecklist = (yield clickUp.createChecklist('GitLab synced checklist')).checklist;
            }
            const clickUpNormalizedChecklist = normalizeClickUpChecklist(clickUpChecklist.items);
            const actions = getSyncChecklistActions(clickUpNormalizedChecklist, gitLabNormalizedChecklist);
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
            console.log(new Date().toLocaleString());
            console.log(status);
        }
    });
}
exports.syncChecklist = syncChecklist;
