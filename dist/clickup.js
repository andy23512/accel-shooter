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
}
exports.ClickUp = ClickUp;
