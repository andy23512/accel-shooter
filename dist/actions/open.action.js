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
exports.openAction = void 0;
const inquirer_1 = __importDefault(require("inquirer"));
const utils_1 = require("../utils");
function openAction() {
    return __awaiter(this, void 0, void 0, function* () {
        const { gitLab, issueNumber } = utils_1.getGitLabFromArgv();
        const answers = yield inquirer_1.default.prompt([
            {
                name: "types",
                message: "Choose Link Type to open",
                type: "checkbox",
                choices: [
                    { name: "Issue", value: "issue" },
                    { name: "Merge Request", value: "merge-request" },
                    { name: "Task", value: "task" },
                ],
            },
        ]);
        const issue = yield gitLab.getIssue(issueNumber);
        for (const type of answers.types) {
            switch (type) {
                case "issue":
                    open(issue.web_url);
                    break;
                case "merge-request":
                    const mergeRequests = yield gitLab.listMergeRequestsWillCloseIssueOnMerge(issueNumber);
                    open(mergeRequests[mergeRequests.length - 1].web_url);
                    break;
                case "task":
                    const description = issue.description;
                    const result = description.match(/https:\/\/app.clickup.com\/t\/\w+/);
                    if (result) {
                        open(result[0]);
                    }
                    break;
            }
        }
    });
}
exports.openAction = openAction;
