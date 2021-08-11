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
exports.syncAction = void 0;
const child_process_1 = require("child_process");
const os_1 = __importDefault(require("os"));
const dynamic_1 = require("set-interval-async/dynamic");
const actions_1 = require("../actions");
const emoji_progress_class_1 = require("../classes/emoji-progress.class");
const config_1 = require("../config");
const utils_1 = require("../utils");
function syncAction() {
    return __awaiter(this, void 0, void 0, function* () {
        actions_1.configReadline();
        const { gitLab, gitLabProject, issueNumber } = utils_1.getGitLabFromArgv();
        const gitLabProjectId = gitLabProject.id;
        const mergeRequests = yield gitLab.listMergeRequestsWillCloseIssueOnMerge(issueNumber);
        const lastMergeRequest = mergeRequests[mergeRequests.length - 1];
        if (lastMergeRequest.state === "merged") {
            console.log("This task is completed.");
            return;
        }
        process.chdir(gitLabProject.path.replace("~", os_1.default.homedir()));
        const branchName = child_process_1.execSync("git branch --show-current", {
            encoding: "utf-8",
        });
        if (branchName.trim() !== lastMergeRequest.source_branch) {
            const isClean = yield utils_1.checkWorkingTreeClean();
            if (!isClean) {
                console.log("\nWorking tree is not clean or something is not pushed. Aborted.");
                process.exit();
            }
            yield utils_1.promiseSpawn("git", ["checkout", lastMergeRequest.source_branch], "pipe");
        }
        console.log(`${gitLabProject.name} ${issueNumber}`);
        const ep = new emoji_progress_class_1.CustomEmojiProgress(100, 100);
        actions_1.setUpSyncHotkey(gitLabProjectId, issueNumber, ep);
        yield actions_1.syncChecklist(gitLabProjectId, issueNumber, ep, true);
        dynamic_1.setIntervalAsync(() => __awaiter(this, void 0, void 0, function* () {
            yield actions_1.syncChecklist(gitLabProjectId, issueNumber, ep, false);
        }), config_1.CONFIG.SyncIntervalInMinutes * 60 * 1000);
    });
}
exports.syncAction = syncAction;
