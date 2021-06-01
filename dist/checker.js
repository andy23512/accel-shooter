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
const rxjs_1 = require("rxjs");
const gitlab_1 = require("./gitlab");
const utils_1 = require("./utils");
class CheckItem {
    constructor(group, name, run) {
        this.group = group;
        this.name = name;
        this.run = run;
    }
    getObs(context) {
        return rxjs_1.concat(rxjs_1.of({ code: -1 }), rxjs_1.defer(() => this.run(context)));
    }
}
const items = [
    new CheckItem("Global", "Check Non-Pushed Changes", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield utils_1.promiseSpawn("git", ["status"], "pipe");
        result.code =
            result.stdout.includes("Your branch is up to date with") &&
                result.stdout.includes("nothing to commit, working tree clean")
                ? 0
                : 1;
        return result;
    })),
    new CheckItem("Global", "Check Conflict", ({ mergeRequest, gitLab }) => __awaiter(void 0, void 0, void 0, function* () {
        const fullMergeRequest = yield gitLab.getMergeRequest(mergeRequest.iid);
        const isConflict = fullMergeRequest.has_conflicts;
        return { code: isConflict ? 1 : 0 };
    })),
    new CheckItem("Frontend", "Check Lint", () => __awaiter(void 0, void 0, void 0, function* () {
        return utils_1.promiseSpawn("docker-compose", ["exec", "frontend", "yarn", "lint"], "pipe");
    })),
    new CheckItem("Frontend", "Check Test", () => __awaiter(void 0, void 0, void 0, function* () {
        return utils_1.promiseSpawn("docker-compose", ["exec", "frontend", "yarn", "jest", "--coverage=false"], "pipe");
    })),
    new CheckItem("Frontend", "Check Prod", () => __awaiter(void 0, void 0, void 0, function* () {
        return utils_1.promiseSpawn("docker-compose", ["exec", "frontend", "yarn", "prod"], "pipe");
    })),
    new CheckItem("Frontend", "Check console.log", ({ frontendChanges }) => __awaiter(void 0, void 0, void 0, function* () {
        return {
            code: frontendChanges.some((c) => c.diff.includes("console.log"))
                ? 1
                : 0,
        };
    })),
    new CheckItem("Frontend", "Check long import", ({ frontendChanges }) => __awaiter(void 0, void 0, void 0, function* () {
        return {
            code: frontendChanges.some((c) => c.diff.includes("../../")) ? 1 : 0,
        };
    })),
    new CheckItem("Backend", "Check Test", () => __awaiter(void 0, void 0, void 0, function* () {
        return utils_1.promiseSpawn("docker-compose", ["exec", "-T", "backend", "pytest", "."], "pipe");
    })),
    new CheckItem("Backend", "Check print", ({ backendChanges }) => __awaiter(void 0, void 0, void 0, function* () {
        return {
            code: backendChanges.some((c) => c.diff.includes("print(")) ? 1 : 0,
        };
    })),
];
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
            const changes = mergeRequestChanges.changes;
            const frontendChanges = changes.filter((c) => c.old_path.startsWith("frontend") || c.new_path.startsWith("frontend"));
            const backendChanges = changes.filter((c) => c.old_path.startsWith("backend") || c.new_path.startsWith("backend"));
            let runningItems = items;
            if (frontendChanges.length === 0) {
                runningItems = items.filter((item) => item.group !== "Frontend");
            }
            if (backendChanges.length === 0) {
                runningItems = items.filter((item) => item.group !== "Backend");
            }
            const context = {
                mergeRequest,
                gitLab: this.gitLab,
                frontendChanges,
                backendChanges,
            };
        });
    }
}
exports.Checker = Checker;
