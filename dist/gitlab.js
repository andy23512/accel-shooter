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
const config_1 = require("./config");
const utils_1 = require("./utils");
const callApi = utils_1.callApiFactory("GitLab");
function getGitLabBranchNameFromIssueNumberAndTitleAndTaskId(issueNumber, clickUpTaskId) {
    return `${issueNumber}_CU-${clickUpTaskId}}`;
}
exports.getGitLabBranchNameFromIssueNumberAndTitleAndTaskId = getGitLabBranchNameFromIssueNumberAndTitleAndTaskId;
class GitLab {
    constructor(projectId) {
        this.projectId = projectId;
    }
    getProject() {
        return callApi("get", `/projects/${this.projectId}`);
    }
    getDefaultBranchName() {
        return __awaiter(this, void 0, void 0, function* () {
            const project = yield this.getProject();
            return project.default_branch;
        });
    }
    getIssue(issueNumber) {
        return callApi("get", `/projects/${this.projectId}/issues/${issueNumber}`);
    }
    getMergeRequest(mergeRequestNumber) {
        return callApi("get", `/projects/${this.projectId}/merge_requests/${mergeRequestNumber}`);
    }
    getMergeRequestChanges(mergeRequestNumber) {
        return callApi("get", `/projects/${this.projectId}/merge_requests/${mergeRequestNumber}/changes`);
    }
    getCommit(sha) {
        return callApi("get", `/projects/${this.projectId}/repository/commits/${sha}`);
    }
    getEndingAssignee() {
        if (!config_1.CONFIG.EndingAssignee) {
            throw Error("No ending assignee was set");
        }
        return callApi("get", `/users`, {
            username: config_1.CONFIG.EndingAssignee,
        }).then((users) => users[0]);
    }
    listProjectLabels() {
        return callApi("get", `/projects/${this.projectId}/labels`, {
            per_page: 100,
        });
    }
    listMergeRequestsWillCloseIssueOnMerge(issueNumber) {
        return callApi("get", `/projects/${this.projectId}/issues/${issueNumber}/closed_by`);
    }
    listPipelineJobs(pipelineId) {
        return callApi("get", `/projects/${this.projectId}/pipelines/${pipelineId}/jobs`);
    }
    listPipelines(query) {
        return __awaiter(this, void 0, void 0, function* () {
            query.ref = query.ref || (yield this.getDefaultBranchName());
            return callApi("get", `/projects/${this.projectId}/pipelines/`, query);
        });
    }
    createIssue(title, description) {
        return __awaiter(this, void 0, void 0, function* () {
            return callApi("post", `/projects/${this.projectId}/issues`, null, {
                title: title,
                description: description,
                assignee_ids: yield this.getUserId(),
            });
        });
    }
    createBranch(branch) {
        return __awaiter(this, void 0, void 0, function* () {
            return callApi("post", `/projects/${this.projectId}/repository/branches`, null, {
                branch,
                ref: yield this.getDefaultBranchName(),
            });
        });
    }
    createMergeRequest(issueNumber, issueTitle, branch) {
        return __awaiter(this, void 0, void 0, function* () {
            return callApi("post", `/projects/${this.projectId}/merge_requests`, null, {
                source_branch: branch,
                target_branch: yield this.getDefaultBranchName(),
                title: `Draft: Resolve "${issueTitle}"`,
                description: `Close #${issueNumber}`,
            });
        });
    }
    markMergeRequestAsReadyAndAddAssignee(merge_request) {
        return __awaiter(this, void 0, void 0, function* () {
            const assignee = yield this.getEndingAssignee();
            yield callApi("put", `/projects/${this.projectId}/merge_requests/${merge_request.iid}`, null, {
                title: merge_request.title.replace("WIP: ", "").replace("Draft: ", ""),
                assignee_id: assignee.id,
            });
        });
    }
    markMergeRequestAsUnreadyAndSetAssigneeToSelf(merge_request) {
        return __awaiter(this, void 0, void 0, function* () {
            yield callApi("put", `/projects/${this.projectId}/merge_requests/${merge_request.iid}`, null, {
                title: "Draft: " +
                    merge_request.title.replace("WIP: ", "").replace("Draft: ", ""),
                assignee_id: yield this.getUserId(),
            });
        });
    }
    getUserId() {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield callApi("get", "/user");
            return user.id;
        });
    }
}
exports.GitLab = GitLab;
