"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const callApi = utils_1.callApiFactory('ClickUp');
function getClickUpTask(clickUpTaskId) {
    return callApi('get', `/task/${clickUpTaskId}`);
}
exports.getClickUpTask = getClickUpTask;
function setClickUpTaskStatus(clickUpTaskId, status) {
    return callApi('put', `/task/${clickUpTaskId}`, { status });
}
exports.setClickUpTaskStatus = setClickUpTaskStatus;
