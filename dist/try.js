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
const text_to_tree_1 = require("./text-to-tree");
const clickup_1 = require("./clickup");
(() => __awaiter(void 0, void 0, void 0, function* () {
    const projectId = 'andy23512%2Fgit-experiment';
    const issueNumber = '20';
    const gitLab = new gitlab_1.GitLab(projectId);
    const issue = yield gitLab.getIssue(issueNumber);
    const issueDescription = issue.description;
    const result = issueDescription.match(/https:\/\/app.clickup.com\/t\/(\w+)/);
    if (result) {
        const clickUpTaskUrl = result[0];
        const clickUpTaskId = result[1];
        const gitLabToDoListText = issueDescription
            .replace(/https:\/\/app.clickup.com\/t\/\w+/g, '')
            .trim();
        const issueChecklistTree = text_to_tree_1.textToTree(gitLabToDoListText);
        const clickUp = new clickup_1.ClickUp(clickUpTaskId);
        const clickUpTasks = yield clickUp.getTask();
        let clickUpChecklist = clickUpTasks.checklists.find((c) => c.name === 'GitLab synced checklist');
        if (!clickUpChecklist) {
            clickUpChecklist = (yield clickUp.createCheckList('GitLab synced checklist')).checklist;
        }
        console.log(clickUpChecklist.items);
        if (clickUpChecklist.items.length === 0) {
            yield recursiveCreateChecklistItem(clickUp, clickUpChecklist, issueChecklistTree, null);
        }
    }
}))();
let counter = -1;
function recursiveCreateChecklistItem(clickUp, clickUpChecklist, nodes, parent) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const node of nodes) {
            counter += 1;
            const parentCheckListItem = yield clickUp.createCheckListItem(clickUpChecklist.id, node.name, counter.toString());
            if (node.children.length) {
                recursiveCreateChecklistItem(clickUp, clickUpChecklist, node.children, parentCheckListItem);
            }
        }
    });
}
