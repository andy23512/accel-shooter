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
const child_process_1 = __importDefault(require("child_process"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const querystring_1 = __importDefault(require("querystring"));
const case_utils_1 = require("./case-utils");
const clickup_1 = require("./clickup");
const config_1 = require("./config");
const RETRY_SETTING = {
    retry: 5,
    pause: 12 * 1000,
};
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function fetchRetry(url, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        let retry = (opts && opts.retry) || 3;
        while (retry > 0) {
            try {
                return yield node_fetch_1.default(url, opts);
            }
            catch (e) {
                if (opts === null || opts === void 0 ? void 0 : opts.callback) {
                    opts.callback(retry);
                }
                retry = retry - 1;
                if (retry == 0) {
                    throw e;
                }
                if (opts === null || opts === void 0 ? void 0 : opts.pause) {
                    yield sleep(opts.pause);
                }
            }
        }
    });
}
function checkStatus(res) {
    if (res) {
        if (res.ok) {
            return res;
        }
        else {
            throw Error(res.statusText);
        }
    }
    else {
        throw Error("Response is undefined.");
    }
}
function callApiFactory(site) {
    let apiUrl = "";
    let headers = {};
    switch (site) {
        case "GitLab":
            apiUrl = "https://gitlab.com/api/v4";
            headers = { "Private-Token": config_1.CONFIG.GitLabToken };
            break;
        case "ClickUp":
            apiUrl = "https://api.clickup.com/api/v2";
            headers = { Authorization: config_1.CONFIG.ClickUpToken };
            break;
        default:
            throw Error(`Site {site} is not supported.`);
    }
    return (method, url, queryParams, body) => __awaiter(this, void 0, void 0, function* () {
        const params = new URLSearchParams();
        if (body) {
            Object.entries(body).forEach(([key, value]) => {
                params.set(key, value);
            });
        }
        if (queryParams) {
            url += "?" + querystring_1.default.stringify(queryParams);
        }
        return fetchRetry(apiUrl + url, method === "get"
            ? Object.assign({ method,
                headers }, RETRY_SETTING) : Object.assign({ method, headers, body: params }, RETRY_SETTING))
            .then(checkStatus)
            .then((res) => res.json())
            .catch((error) => {
            console.log(apiUrl + url);
            throw error;
        });
    });
}
exports.callApiFactory = callApiFactory;
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
const dpItemRegex = /\* \([A-Za-z ]+\) .*? \(#([0-9]+|\?), https:\/\/app.clickup.com\/t\/(\w+)\)/g;
function updateTaskStatusInDp(dp) {
    return __awaiter(this, void 0, void 0, function* () {
        let match = null;
        let resultDp = dp;
        while ((match = dpItemRegex.exec(dp))) {
            const full = match[0];
            const clickUpTaskId = match[2];
            const clickUp = new clickup_1.ClickUp(clickUpTaskId);
            const task = yield clickUp.getTask();
            const updatedFull = full.replace(/\* \([A-Za-z ]+\)/, `* (${case_utils_1.titleCase(task.status.status)})`);
            resultDp = resultDp.replace(full, updatedFull);
        }
        return resultDp;
    });
}
exports.updateTaskStatusInDp = updateTaskStatusInDp;
