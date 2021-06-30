"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.checkWorkingTreeClean = exports.getGitLabBranchNameFromIssueNumberAndTitleAndTaskId = exports.getGitLabFromArgv = exports.updateTaskStatusInDp = exports.getClickUpTaskIdFromGitLabIssue = exports.getGitLabProjectConfigById = exports.getGitLabProjectConfigByName = exports.promiseSpawn = exports.normalizeClickUpChecklist = exports.normalizeGitLabIssueChecklist = void 0;
const child_process_1 = __importStar(require("child_process"));
const case_utils_1 = require("./case-utils");
const clickup_class_1 = require("./classes/clickup.class");
const gitlab_class_1 = require("./classes/gitlab.class");
const config_1 = require("./config");
function normalizeGitLabIssueChecklist(checklistText) {
    return checklistText
        .split("\n")
        .filter((line) => line && (line.includes("- [ ]") || line.includes("- [x]")))
        .map((line, index) => ({
        name: line
            .replace(/- \[[x ]\] /g, "")
            .replace(/^ +/, (space) => space.replace(/ /g, "-")),
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
function promiseSpawn(command, args, stdio = "inherit") {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            var _a, _b;
            const child = child_process_1.default.spawn(command, args, {
                shell: true,
                stdio,
            });
            if (stdio === "pipe") {
                let stdout = "";
                let stderr = "";
                (_a = child.stdout) === null || _a === void 0 ? void 0 : _a.on("data", (d) => {
                    const output = d.toString();
                    stdout += output;
                });
                (_b = child.stderr) === null || _b === void 0 ? void 0 : _b.on("data", (d) => {
                    const output = d.toString();
                    stderr += output;
                });
                child.on("close", (code) => {
                    resolve({ stdout, stderr, code });
                });
            }
            else {
                child.on("close", (code) => (code === 0 ? resolve(1) : reject()));
            }
            child.on("error", (err) => {
                console.log(err);
            });
        });
    });
}
exports.promiseSpawn = promiseSpawn;
function getGitLabProjectConfigByName(n) {
    return config_1.CONFIG.GitLabProjects.find(({ name }) => name === n);
}
exports.getGitLabProjectConfigByName = getGitLabProjectConfigByName;
function getGitLabProjectConfigById(inputId) {
    return config_1.CONFIG.GitLabProjects.find(({ id }) => id === inputId);
}
exports.getGitLabProjectConfigById = getGitLabProjectConfigById;
function getClickUpTaskIdFromGitLabIssue(issue) {
    const description = issue.description;
    const result = description.match(/https:\/\/app.clickup.com\/t\/(\w+)/);
    return result ? result[1] : null;
}
exports.getClickUpTaskIdFromGitLabIssue = getClickUpTaskIdFromGitLabIssue;
const dpItemRegex = /\* \([A-Za-z ]+\) .*? \((#[0-9]+|#\?|\w+ \d+), https:\/\/app.clickup.com\/t\/(\w+)\)/g;
function updateTaskStatusInDp(dp) {
    return __awaiter(this, void 0, void 0, function* () {
        let match = null;
        let resultDp = dp;
        while ((match = dpItemRegex.exec(dp))) {
            const full = match[0];
            const clickUpTaskId = match[2];
            const clickUp = new clickup_class_1.ClickUp(clickUpTaskId);
            const task = yield clickUp.getTask();
            const updatedFull = full.replace(/\* \([A-Za-z ]+\)/, `* (${case_utils_1.titleCase(task.status.status)})`);
            resultDp = resultDp.replace(full, updatedFull);
        }
        return resultDp;
    });
}
exports.updateTaskStatusInDp = updateTaskStatusInDp;
function getGitLabFromArgv() {
    if (process.argv.length === 3) {
        const directory = child_process_1.execSync("pwd", { encoding: "utf-8" });
        const gitLabProject = config_1.CONFIG.GitLabProjects.find((p) => directory.startsWith(p.path));
        if (!gitLabProject) {
            throw Error("No such project");
        }
        const branchName = child_process_1.execSync("git branch --show-current", {
            encoding: "utf-8",
        });
        const match = branchName.match(/^[0-9]+/);
        if (!match) {
            throw Error("Cannot get issue number from branch");
        }
        const issueNumber = match[0];
        const gitLab = new gitlab_class_1.GitLab(gitLabProject.id);
        return { gitLab, gitLabProject, issueNumber };
    }
    else {
        const gitLabProject = getGitLabProjectFromArgv();
        if (!gitLabProject) {
            throw Error("No such project");
        }
        const gitLab = new gitlab_class_1.GitLab(gitLabProject.id);
        return { gitLab, gitLabProject, issueNumber: process.argv[4] };
    }
}
exports.getGitLabFromArgv = getGitLabFromArgv;
function getGitLabProjectFromArgv() {
    return getGitLabProjectConfigByName(process.argv[3]);
}
function getGitLabBranchNameFromIssueNumberAndTitleAndTaskId(issueNumber, clickUpTaskId) {
    return `${issueNumber}_CU-${clickUpTaskId}`;
}
exports.getGitLabBranchNameFromIssueNumberAndTitleAndTaskId = getGitLabBranchNameFromIssueNumberAndTitleAndTaskId;
function checkWorkingTreeClean() {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield promiseSpawn("git", ["status"], "pipe");
        if (!result.stdout.includes("Your branch is up to date with") ||
            !result.stdout.includes("nothing to commit, working tree clean")) {
            throw Error("Working tree is not clean or something is not pushed. Aborted.");
        }
    });
}
exports.checkWorkingTreeClean = checkWorkingTreeClean;
