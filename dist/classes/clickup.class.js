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
exports.ClickUp = void 0;
const api_utils_1 = require("../api.utils");
const callApi = api_utils_1.callApiFactory("ClickUp");
class ClickUp {
    constructor(taskId) {
        this.taskId = taskId;
    }
    static getCurrentUser() {
        return callApi("get", `/user/`);
    }
    static getList(listId) {
        return callApi("get", `/list/${listId}`);
    }
    static getTeams() {
        return callApi("get", `/team/`);
    }
    static getRTVTasks(teamId, userID) {
        return callApi("get", `/team/${teamId}/task/`, {
            statuses: ["ready to verify"],
            include_closed: true,
            assignees: [userID],
        });
    }
    static getMyTasks(teamId, userID) {
        return callApi("get", `/team/${teamId}/task/`, {
            statuses: ["Open", "pending", "ready to do", "in progress"],
            assignees: [userID],
            subtasks: true,
        });
    }
    getTask() {
        return callApi("get", `/task/${this.taskId}`);
    }
    getTaskComments() {
        return callApi("get", `/task/${this.taskId}/comment/`).then((r) => r.comments);
    }
    setTaskStatus(status) {
        return callApi("put", `/task/${this.taskId}`, null, { status });
    }
    createChecklist(name) {
        return callApi("post", `/task/${this.taskId}/checklist`, null, { name });
    }
    createChecklistItem(checklistId, name, resolved, orderindex) {
        return callApi("post", `/checklist/${checklistId}/checklist_item`, null, {
            name,
            resolved,
            orderindex,
        });
    }
    updateChecklistItem(checklistId, checklistItemId, name, resolved, orderindex) {
        return callApi("put", `/checklist/${checklistId}/checklist_item/${checklistItemId}`, null, {
            name,
            resolved,
            orderindex,
        });
    }
    deleteChecklistItem(checklistId, checklistItemId) {
        return callApi("delete", `/checklist/${checklistId}/checklist_item/${checklistItemId}`);
    }
    getFrameUrls() {
        return __awaiter(this, void 0, void 0, function* () {
            let currentTaskId = this.taskId;
            const frameUrls = [];
            while (currentTaskId) {
                const clickUp = new ClickUp(currentTaskId);
                const task = yield clickUp.getTask();
                const comments = yield clickUp.getTaskComments();
                comments.forEach((co) => {
                    co.comment
                        .filter((c) => c.type === "frame")
                        .forEach((c) => {
                        var _a;
                        if ((_a = c === null || c === void 0 ? void 0 : c.frame) === null || _a === void 0 ? void 0 : _a.url) {
                            frameUrls.push(c.frame.url);
                        }
                    });
                });
                currentTaskId = task.parent;
            }
            return frameUrls;
        });
    }
}
exports.ClickUp = ClickUp;
