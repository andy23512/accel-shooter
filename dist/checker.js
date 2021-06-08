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
exports.Checker = void 0;
const fs_1 = require("fs");
const os_1 = __importDefault(require("os"));
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const untildify_1 = __importDefault(require("untildify"));
const gitlab_1 = require("./gitlab");
const utils_1 = require("./utils");
const SPINNER = [
    "🕛",
    "🕐",
    "🕑",
    "🕒",
    "🕓",
    "🕔",
    "🕕",
    "🕖",
    "🕗",
    "🕘",
    "🕙",
    "🕚",
];
class CheckItem {
    constructor(group, name, run, stdoutReducer) {
        this.group = group;
        this.name = name;
        this.run = run;
        this.stdoutReducer = stdoutReducer;
    }
    getObs(context) {
        return rxjs_1.concat(rxjs_1.of({
            group: this.group,
            name: this.name,
            code: -1,
            stdout: "",
            stderr: "",
        }), rxjs_1.defer(() => this.run(context)).pipe(operators_1.map((d) => {
            const result = d;
            result.group = this.group;
            result.name = this.name;
            if (this.stdoutReducer && result.stdout) {
                result.stdout = this.stdoutReducer(result.stdout);
            }
            return result;
        })));
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
        return utils_1.promiseSpawn("docker-compose", ["exec", "-T", "frontend", "yarn", "lint"], "pipe");
    })),
    new CheckItem("Frontend", "Check Test", () => __awaiter(void 0, void 0, void 0, function* () {
        return utils_1.promiseSpawn("docker-compose", ["exec", "-T", "frontend", "yarn", "jest", "--coverage=false"], "pipe");
    }), (stdout) => stdout
        .split("\n")
        .filter((line) => !line.startsWith("PASS"))
        .join("\n")),
    new CheckItem("Frontend", "Check Prod", () => __awaiter(void 0, void 0, void 0, function* () {
        return utils_1.promiseSpawn("docker-compose", ["exec", "-T", "frontend", "yarn", "prod"], "pipe");
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
            code: frontendChanges.some((c) => c.new_path.endsWith(".ts") && c.diff.includes("../../lib/"))
                ? 1
                : 0,
        };
    })),
    new CheckItem("Backend", "Check Test (unittest)", () => __awaiter(void 0, void 0, void 0, function* () {
        return utils_1.promiseSpawn("docker-compose", ["exec", "-T", "backend", "./manage.py", "test"], "pipe");
    })),
    new CheckItem("Backend", "Check Test (pytest)", () => __awaiter(void 0, void 0, void 0, function* () {
        return utils_1.promiseSpawn("docker-compose", ["exec", "-T", "backend", "pytest", "."], "pipe");
    })),
    new CheckItem("Backend", "Check Print", ({ backendChanges }) => __awaiter(void 0, void 0, void 0, function* () {
        return {
            code: backendChanges.some((c) => c.diff.includes("print(")) ? 1 : 0,
        };
    })),
    new CheckItem("Backend", "Check Migration Conflict", ({ mergeRequest, backendChanges, gitLab }) => __awaiter(void 0, void 0, void 0, function* () {
        if (!backendChanges.some((c) => c.new_path.includes("migrations"))) {
            return { code: 0 };
        }
        const branchName = mergeRequest.source_branch;
        const defaultBranch = yield gitLab.getDefaultBranchName();
        const compare = yield gitLab.getCompare(defaultBranch, branchName);
        const migrationDiffs = compare.diffs.filter((d) => (d.new_file || d.deleted_file) && d.new_path.includes("migration"));
        const plusFiles = new Set(migrationDiffs
            .filter((d) => d.new_file)
            .map((d) => {
            const match = d.new_path.match(/backend\/(\w+)\/migrations\/(\d+)/);
            return match ? match[1] + "_" + match[2] : null;
        })
            .filter(Boolean));
        const minusFiles = new Set(migrationDiffs
            .filter((d) => d.deleted_file)
            .map((d) => {
            const match = d.new_path.match(/backend\/(\w+)\/migrations\/(\d+)/);
            return match ? match[1] + "_" + match[2] : null;
        })
            .filter(Boolean));
        return {
            code: [...plusFiles].filter((f) => minusFiles.has(f)).length > 0 ? 1 : 0,
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
            yield utils_1.promiseSpawn("git", ["checkout", mergeRequest.source_branch], "pipe");
            const changes = mergeRequestChanges.changes;
            const frontendChanges = changes.filter((c) => c.new_path.startsWith("frontend"));
            const backendChanges = changes.filter((c) => c.new_path.startsWith("backend"));
            let runningItems = items;
            if (frontendChanges.length === 0) {
                runningItems = items.filter((item) => item.group !== "Frontend");
            }
            if (backendChanges.length === 0) {
                runningItems = items.filter((item) => item.group !== "Backend");
            }
            if (this.gitLabProject.ignoredCheck &&
                this.gitLabProject.ignoredCheck.length > 0) {
                const ignoredCheck = this.gitLabProject.ignoredCheck;
                runningItems = items.filter((item) => !ignoredCheck.includes(`${item.group}/${item.name}`));
            }
            const context = {
                mergeRequest,
                gitLab: this.gitLab,
                frontendChanges,
                backendChanges,
            };
            const obss = runningItems.map((r) => r.getObs(context));
            const checkStream = rxjs_1.combineLatest(obss);
            process.stdout.write(runningItems.map((r) => "").join("\n"));
            const s = rxjs_1.combineLatest([rxjs_1.interval(60), checkStream]).subscribe(([count, statusList]) => {
                process.stdout.moveCursor(0, -statusList.length + 1);
                process.stdout.cursorTo(0);
                process.stdout.clearScreenDown();
                process.stdout.write(statusList
                    .map((s, index) => {
                    let emoji = "";
                    switch (s.code) {
                        case -1:
                            emoji = SPINNER[count % SPINNER.length];
                            break;
                        case 0:
                            emoji = index % 2 === 0 ? "🐰" : "🥕";
                            break;
                        case 1:
                            emoji = "❌";
                            break;
                        default:
                            emoji = "🔴";
                    }
                    return `${emoji} [${s.group}] ${s.name}`;
                })
                    .join("\n"));
                if (statusList.every((s) => s.code !== -1)) {
                    s.unsubscribe();
                    const nonSuccessStatusList = statusList.filter((s) => s.code !== 0);
                    if (nonSuccessStatusList.length > 0) {
                        fs_1.writeFile(untildify_1.default("~/ac-checker-log"), nonSuccessStatusList
                            .map((s) => `###### [${s.group}] ${s.name} ${s.code}\n${s.stdout}\n${s.stderr}`)
                            .join("\n\n"), () => { });
                    }
                }
            });
        });
    }
}
exports.Checker = Checker;
