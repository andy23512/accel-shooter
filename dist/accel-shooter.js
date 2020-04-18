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
const fs_1 = require("fs");
const open_1 = __importDefault(require("open"));
const path_1 = require("path");
const config_1 = require("./config");
const clickup_1 = require("./clickup");
const gitlab_1 = require("./gitlab");
(() => __awaiter(void 0, void 0, void 0, function* () {
    const action = process.argv[2];
    switch (action) {
        case 'config':
        case 'c':
            const configFile = process.argv[3];
            setConfigFile(configFile);
            break;
        case 'start':
        case 's':
            const gitLabProjectId = getGitLabProjectId();
            const clickUpTaskId = getClickUpTaskId();
            const clickUpTask = yield clickup_1.getClickUpTask(clickUpTaskId);
            const clickUpTaskUrl = clickUpTask['url'];
            const gitLabIssueTitle = process.argv.length >= 6 ? process.argv[5] : clickUpTask['name'];
            yield clickup_1.setClickUpTaskStatus(clickUpTaskId, 'in progress');
            const gitLabIssue = yield gitlab_1.addGitLabIssue(gitLabProjectId, gitLabIssueTitle, clickUpTaskUrl);
            const gitLabIssueUrl = gitLabIssue.web_url;
            const gitLabIssueNumber = gitLabIssue.iid;
            console.log(`GitLab Issue Number: ${gitLabIssueNumber}`);
            console.log(`GitLab Issue: ${gitLabIssueUrl}`);
            console.log(`ClickUp Task: ${clickUpTaskUrl}`);
            console.log(`HackMD Daily Progress: ${config_1.CONFIG.HackMDNoteUrl}`);
            open_1.default(config_1.CONFIG.HackMDNoteUrl);
            open_1.default(clickUpTaskUrl);
            open_1.default(gitLabIssueUrl);
        default:
            throw Error(`Action {action} is not supported`);
    }
}))();
function setConfigFile(configFile) {
    const src = path_1.resolve(configFile);
    const dest = path_1.resolve(__dirname, '../.config.json');
    fs_1.copyFileSync(src, dest);
}
function getGitLabProjectId() {
    return (config_1.CONFIG.GitLabProjectMap[process.argv[3]] || process.argv[3]).replace(/\//g, '%2F');
}
function getClickUpTaskId() {
    return process.argv[4].replace(/#/g, '');
}
