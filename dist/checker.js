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
const items = [
    {
        group: "Global",
        name: "Check Non-Pushed Changes",
        run() {
            return __awaiter(this, void 0, void 0, function* () {
                const result = yield utils_1.promiseSpawn("git", ["status"], "pipe");
                result.code =
                    result.stdout.includes("Your branch is up to date with") &&
                        result.stdout.includes("nothing to commit, working tree clean")
                        ? 0
                        : 1;
                return result;
            });
        },
    },
    {
        group: "Global",
        name: "Check Conflict",
        run({ mergeRequest, gitLab }) {
            return __awaiter(this, void 0, void 0, function* () {
                const fullMergeRequest = yield gitLab.getMergeRequest(mergeRequest.iid);
                const isConflict = fullMergeRequest.has_conflicts;
                return { code: isConflict ? 1 : 0 };
            });
        },
    },
    {
        group: "Frontend",
        name: "Check Lint",
        run() {
            return __awaiter(this, void 0, void 0, function* () {
                return utils_1.promiseSpawn("docker-compose", ["exec", "frontend", "yarn", "lint"], "pipe");
            });
        },
    },
    {
        group: "Frontend",
        name: "Check Test",
        run() {
            return __awaiter(this, void 0, void 0, function* () {
                return utils_1.promiseSpawn("docker-compose", ["exec", "frontend", "yarn", "jest", "--coverage=false"], "pipe");
            });
        },
    },
    {
        group: "Frontend",
        name: "Check Prod",
        run() {
            return __awaiter(this, void 0, void 0, function* () {
                return utils_1.promiseSpawn("docker-compose", ["exec", "frontend", "yarn", "prod"], "pipe");
            });
        },
    },
    {
        group: "Frontend",
        name: "Check console.log",
        run({ frontendChanges }) {
            return __awaiter(this, void 0, void 0, function* () {
                return {
                    code: frontendChanges.some((c) => c.diff.includes("console.log"))
                        ? 1
                        : 0,
                };
            });
        },
    },
    {
        group: "Frontend",
        name: "Check long import",
        run({ frontendChanges }) {
            return __awaiter(this, void 0, void 0, function* () {
                return {
                    code: frontendChanges.some((c) => c.diff.includes("../../")) ? 1 : 0,
                };
            });
        },
    },
    {
        group: "Backend",
        name: "Check Test",
        run() {
            return __awaiter(this, void 0, void 0, function* () {
                return utils_1.promiseSpawn("docker-compose", ["exec", "-T", "backend", "pytest", "."], "pipe");
            });
        },
    },
    {
        group: "Backend",
        name: "Check print",
        run({ backendChanges }) {
            return __awaiter(this, void 0, void 0, function* () {
                return {
                    code: backendChanges.some((c) => c.diff.includes("print(")) ? 1 : 0,
                };
            });
        },
    },
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
                runningItems = items.filter((item) => item.group !== "Frontend");
            }
        });
    }
}
exports.Checker = Checker;
