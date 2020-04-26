"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const callApi = utils_1.callApiFactory('ClickUp');
class ClickUp {
    constructor(taskId) {
        this.taskId = taskId;
    }
    getTask() {
        return callApi('get', `/task/${this.taskId}`);
    }
    setTaskStatus(status) {
        return callApi('put', `/task/${this.taskId}`, { status });
    }
    createChecklist(name) {
        return callApi('post', `/task/${this.taskId}/checklist`, { name });
    }
    createChecklistItem(checklistId, name, resolved, orderindex) {
        return callApi('post', `/checklist/${checklistId}/checklist_item`, {
            name,
            resolved,
            orderindex,
        });
    }
    updateChecklistItem(checklistId, checklistItemId, name, resolved, orderindex) {
        return callApi('put', `/checklist/${checklistId}/checklist_item/${checklistItemId}`, {
            name,
            resolved,
            orderindex,
        });
    }
    deleteChecklistItem(checklistId, checklistItemId) {
        return callApi('delete', `/checklist/${checklistId}/checklist_item/${checklistItemId}`);
    }
}
exports.ClickUp = ClickUp;
