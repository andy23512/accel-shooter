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
exports.endAction = void 0;
const clickup_class_1 = require("../classes/clickup.class");
const progress_log_class_1 = require("../classes/progress-log.class");
const utils_1 = require("../utils");
function endAction() {
    return __awaiter(this, void 0, void 0, function* () {
        const { gitLab, issueNumber } = utils_1.getGitLabFromArgv();
        const p = new progress_log_class_1.CustomProgressLog("End", [
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
            process.exit();
        }
        p.next();
        const mergeRequests = yield gitLab.listMergeRequestsWillCloseIssueOnMerge(issueNumber);
        const mergeRequest = mergeRequests[mergeRequests.length - 1];
        p.next();
        yield gitLab.markMergeRequestAsReadyAndAddAssignee(mergeRequest);
        p.next();
        const clickUpTaskId = utils_1.getClickUpTaskIdFromGitLabIssue(issue);
        if (clickUpTaskId) {
            const clickUp = new clickup_class_1.ClickUp(clickUpTaskId);
            yield clickUp.setTaskStatus("in review");
        }
        p.end(0);
    });
}
exports.endAction = endAction;
