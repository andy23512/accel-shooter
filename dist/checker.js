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
const os_1 = __importDefault(require("os"));
const gitlab_1 = require("./gitlab");
const utils_1 = require("./utils");
class Checker {
    constructor(gitLabProject, issueNumber) {
        this.gitLabProject = gitLabProject;
        this.issueNumber = issueNumber;
        this.gitLabProjectId = this.gitLabProject.id;
        this.gitLab = new gitlab_1.GitLab(this.gitLabProjectId);
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            const mergeRequests = yield this.gitLab.listMergeRequestsWillCloseIssueOnMerge(this.issueNumber);
            const mergeRequest = mergeRequests[mergeRequests.length - 1];
            const mergeRequestChanges = yield this.gitLab.getMergeRequestChanges(mergeRequest.iid);
            process.chdir(this.gitLabProject.path.replace("~", os_1.default.homedir()));
            yield utils_1.promiseSpawn("git", ["checkout", mergeRequest.source_branch]);
        });
    }
}
exports.Checker = Checker;
