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
const utils_1 = require("./utils");
const callApi = utils_1.callApiFactory('GitLab');
function getGitLabBranchNameFromIssueNumberAndTitle(issueNumber, issueTitle) {
    return utils_1.dashify(`${issueNumber}-${issueTitle}`);
}
exports.getGitLabBranchNameFromIssueNumberAndTitle = getGitLabBranchNameFromIssueNumberAndTitle;
class GitLab {
    constructor(projectId) {
        this.projectId = projectId;
    }
    getProject() {
        return callApi('get', `/projects/${this.projectId}`);
    }
    getDefaultBranchName() {
        return __awaiter(this, void 0, void 0, function* () {
            const project = yield this.getProject();
            return project.default_branch;
        });
    }
    listProjectLabels() {
        return callApi('get', `/projects/${this.projectId}/labels`);
    }
    createIssue(title, description, labels) {
        return __awaiter(this, void 0, void 0, function* () {
            return callApi('post', `/projects/${this.projectId}/issues`, {
                title: title,
                description: description,
                assignee_ids: yield this.getUserId(),
                labels: labels.join(','),
            });
        });
    }
    createBranch(branch) {
        return __awaiter(this, void 0, void 0, function* () {
            return callApi('post', `/projects/${this.projectId}/repository/branches`, {
                branch,
                ref: yield this.getDefaultBranchName(),
            });
        });
    }
    createMergeRequest(issueNumber, issueTitle, branch, labels) {
        return __awaiter(this, void 0, void 0, function* () {
            return callApi('post', `/projects/${this.projectId}/merge_requests`, {
                source_branch: branch,
                target_branch: yield this.getDefaultBranchName(),
                title: `WIP: Resolve "${issueTitle}"`,
                description: `Close #${issueNumber}`,
                labels: labels.join(','),
            });
        });
    }
    getUserId() {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield callApi('get', '/user');
            return user.id;
        });
    }
}
exports.GitLab = GitLab;
