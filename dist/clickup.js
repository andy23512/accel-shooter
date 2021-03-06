"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickUp = void 0;
const utils_1 = require("./utils");
const callApi = utils_1.callApiFactory("ClickUp");
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
}
exports.ClickUp = ClickUp;
