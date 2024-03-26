/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const tslib_1 = __webpack_require__(4);
const node_shared_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(37);
const serve_static_1 = __webpack_require__(38);
const path_1 = __webpack_require__(10);
const app_controller_1 = __webpack_require__(39);
const app_service_1 = __webpack_require__(45);
let AppModule = exports.AppModule = class AppModule {
};
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, load: [node_shared_1.getConfig] }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'frontend'),
                serveStaticOptions: { cacheControl: false },
            }),
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);


/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(4);
tslib_1.__exportStar(__webpack_require__(6), exports);


/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.sleep = exports.formatDate = exports.DateFormat = exports.getTaskIdFromBranchName = exports.normalizeMarkdownChecklist = exports.normalizeClickUpChecklist = exports.getSyncChecklistActions = exports.titleCase = exports.ProjectCheckItem = exports.NormalizedChecklist = exports.IHoliday = exports.GitLabProject = exports.FullMergeRequest = exports.Change = exports.Job = exports.Approval = exports.ClickUpUser = exports.Task = exports.TaskStatus = exports.Space = exports.Comment = exports.ChecklistItem = exports.getConfig = exports.CONFIG = exports.Google = exports.GitLab = exports.ClickUp = void 0;
var clickup_class_1 = __webpack_require__(7);
Object.defineProperty(exports, "ClickUp", ({ enumerable: true, get: function () { return clickup_class_1.ClickUp; } }));
var gitlab_class_1 = __webpack_require__(20);
Object.defineProperty(exports, "GitLab", ({ enumerable: true, get: function () { return gitlab_class_1.GitLab; } }));
var google_class_1 = __webpack_require__(23);
Object.defineProperty(exports, "Google", ({ enumerable: true, get: function () { return google_class_1.Google; } }));
var config_1 = __webpack_require__(11);
Object.defineProperty(exports, "CONFIG", ({ enumerable: true, get: function () { return config_1.CONFIG; } }));
Object.defineProperty(exports, "getConfig", ({ enumerable: true, get: function () { return config_1.getConfig; } }));
var checklist_models_1 = __webpack_require__(26);
Object.defineProperty(exports, "ChecklistItem", ({ enumerable: true, get: function () { return checklist_models_1.ChecklistItem; } }));
var comment_models_1 = __webpack_require__(27);
Object.defineProperty(exports, "Comment", ({ enumerable: true, get: function () { return comment_models_1.Comment; } }));
var space_models_1 = __webpack_require__(28);
Object.defineProperty(exports, "Space", ({ enumerable: true, get: function () { return space_models_1.Space; } }));
var task_status_enum_1 = __webpack_require__(29);
Object.defineProperty(exports, "TaskStatus", ({ enumerable: true, get: function () { return task_status_enum_1.TaskStatus; } }));
var task_models_1 = __webpack_require__(30);
Object.defineProperty(exports, "Task", ({ enumerable: true, get: function () { return task_models_1.Task; } }));
var user_models_1 = __webpack_require__(31);
Object.defineProperty(exports, "ClickUpUser", ({ enumerable: true, get: function () { return user_models_1.User; } }));
var approval_models_1 = __webpack_require__(32);
Object.defineProperty(exports, "Approval", ({ enumerable: true, get: function () { return approval_models_1.Approval; } }));
var job_models_1 = __webpack_require__(33);
Object.defineProperty(exports, "Job", ({ enumerable: true, get: function () { return job_models_1.Job; } }));
var merge_request_models_1 = __webpack_require__(34);
Object.defineProperty(exports, "Change", ({ enumerable: true, get: function () { return merge_request_models_1.Change; } }));
Object.defineProperty(exports, "FullMergeRequest", ({ enumerable: true, get: function () { return merge_request_models_1.FullMergeRequest; } }));
var models_1 = __webpack_require__(35);
Object.defineProperty(exports, "GitLabProject", ({ enumerable: true, get: function () { return models_1.GitLabProject; } }));
Object.defineProperty(exports, "IHoliday", ({ enumerable: true, get: function () { return models_1.IHoliday; } }));
Object.defineProperty(exports, "NormalizedChecklist", ({ enumerable: true, get: function () { return models_1.NormalizedChecklist; } }));
Object.defineProperty(exports, "ProjectCheckItem", ({ enumerable: true, get: function () { return models_1.ProjectCheckItem; } }));
var case_utils_1 = __webpack_require__(18);
Object.defineProperty(exports, "titleCase", ({ enumerable: true, get: function () { return case_utils_1.titleCase; } }));
var checklist_utils_1 = __webpack_require__(19);
Object.defineProperty(exports, "getSyncChecklistActions", ({ enumerable: true, get: function () { return checklist_utils_1.getSyncChecklistActions; } }));
Object.defineProperty(exports, "normalizeClickUpChecklist", ({ enumerable: true, get: function () { return checklist_utils_1.normalizeClickUpChecklist; } }));
Object.defineProperty(exports, "normalizeMarkdownChecklist", ({ enumerable: true, get: function () { return checklist_utils_1.normalizeMarkdownChecklist; } }));
var clickup_utils_1 = __webpack_require__(36);
Object.defineProperty(exports, "getTaskIdFromBranchName", ({ enumerable: true, get: function () { return clickup_utils_1.getTaskIdFromBranchName; } }));
var date_utils_1 = __webpack_require__(21);
Object.defineProperty(exports, "DateFormat", ({ enumerable: true, get: function () { return date_utils_1.DateFormat; } }));
Object.defineProperty(exports, "formatDate", ({ enumerable: true, get: function () { return date_utils_1.formatDate; } }));
var sleep_utils_1 = __webpack_require__(17);
Object.defineProperty(exports, "sleep", ({ enumerable: true, get: function () { return sleep_utils_1.sleep; } }));


/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ClickUp = void 0;
const cli_progress_1 = __webpack_require__(8);
const fs_1 = __webpack_require__(9);
const path_1 = __webpack_require__(10);
const config_1 = __webpack_require__(11);
const node_shared_1 = __webpack_require__(6);
const api_utils_1 = __webpack_require__(14);
const case_utils_1 = __webpack_require__(18);
const checklist_utils_1 = __webpack_require__(19);
const FIGMA_REGEX = /(?:https:\/\/)?(?:www\.)?figma\.com\/(file|proto)\/([0-9a-zA-Z]{22,128})(?:\/([^\?\n\r\/]+)?((?:\?[^\/]*?node-id=([^&\n\r\/]+))?[^\/]*?)(\/duplicate)?)?/g;
const callApi = (0, api_utils_1.callApiFactory)('ClickUp');
class ClickUp {
    constructor(taskId) {
        this.taskId = taskId;
    }
    static getCurrentUser() {
        return callApi('get', `/user/`);
    }
    static getList(listId) {
        return callApi('get', `/list/${listId}`);
    }
    static getTeams() {
        return callApi('get', `/team/`);
    }
    static getSpace(spaceId) {
        return callApi('get', `/space/${spaceId}`);
    }
    static async getProduct(task) {
        const space = await ClickUp.getSpace(task.space.id);
        if (space.name === 'Product Team') {
            const list = await ClickUp.getList(task.list.id);
            if (list.folder.name === 'Product Request Mgmt') {
                return list.name;
            }
            const productField = task.custom_fields?.find((f) => f.name === 'Product');
            if (!productField) {
                throw Error('No product field in this task');
            }
            const product = productField.type_config.options.find((t) => t.orderindex === productField.value);
            if (!product) {
                throw Error(`No matched product in this task (${task.id})`);
            }
            return product.name;
        }
        return space.name;
    }
    static getRTVTasks(teamId, userID) {
        return callApi('get', `/team/${teamId}/task/`, {
            statuses: [node_shared_1.TaskStatus.ReadyToVerify],
            include_closed: true,
            assignees: [userID],
        });
    }
    static getMyTasks(teamId, userID) {
        return callApi('get', `/team/${teamId}/task/`, {
            statuses: [
                node_shared_1.TaskStatus.Open,
                node_shared_1.TaskStatus.Pending,
                node_shared_1.TaskStatus.ReadyToDo,
                node_shared_1.TaskStatus.ReadyToDev,
                node_shared_1.TaskStatus.InProgress,
                node_shared_1.TaskStatus.DevInProgress,
                node_shared_1.TaskStatus.InDiscussion,
            ],
            assignees: [userID],
            subtasks: true,
        });
    }
    getTask() {
        return callApi('get', `/task/${this.taskId}`);
    }
    getTaskIncludeSubTasks() {
        return callApi('get', `/task/${this.taskId}`, {
            include_subtasks: true,
        });
    }
    getTaskComments() {
        return callApi('get', `/task/${this.taskId}/comment/`).then((r) => r.comments);
    }
    setTaskStatus(status) {
        return callApi('put', `/task/${this.taskId}`, null, { status });
    }
    setTaskTimeEstimate(timeEstimate) {
        return callApi('put', `/task/${this.taskId}`, null, {
            time_estimate: timeEstimate,
        });
    }
    setTaskStartDateToToday() {
        return callApi('put', `/task/${this.taskId}`, null, {
            start_date: new Date().valueOf(),
        });
    }
    setTaskDueDateToToday() {
        return callApi('put', `/task/${this.taskId}`, null, {
            due_date: new Date().valueOf(),
        });
    }
    createChecklist(name) {
        return callApi('post', `/task/${this.taskId}/checklist`, null, { name });
    }
    createChecklistItem(checklistId, name, resolved, orderindex) {
        return callApi('post', `/checklist/${checklistId}/checklist_item`, null, {
            name,
            resolved,
            orderindex,
        });
    }
    updateChecklistItem(checklistId, checklistItemId, name, resolved, orderindex) {
        return callApi('put', `/checklist/${checklistId}/checklist_item/${checklistItemId}`, null, {
            name,
            resolved,
            orderindex,
        });
    }
    deleteChecklistItem(checklistId, checklistItemId) {
        return callApi('delete', `/checklist/${checklistId}/checklist_item/${checklistItemId}`);
    }
    async getGitLabProjectAndMergeRequestIId(task) {
        const t = task || (await this.getTask());
        const clickUpChecklist = t.checklists.find((c) => c.name.toLowerCase().includes('synced checklist'));
        if (clickUpChecklist) {
            const match = clickUpChecklist.name.match(/\[(.*?) !([\d]+)\]/);
            if (match) {
                return {
                    gitLabProject: config_1.CONFIG.GitLabProjects.find((p) => p.repo.toLowerCase() === match[1].toLowerCase()),
                    mergeRequestIId: match[2],
                };
            }
        }
        console.warn(`No synced checklist found in this task: ${t.id}`);
        return null;
    }
    async getFullTaskName(task) {
        let t = task || (await this.getTask());
        let result = t.name;
        while (t.parent) {
            t = await new ClickUp(t.parent).getTask();
            result = `${t.name} - ${result}`;
        }
        return result;
    }
    async getTaskString(mode) {
        const task = await this.getTask();
        const name = await this.getFullTaskName(task);
        const progress = this.getTaskProgress();
        const gitLabInfo = await this.getGitLabProjectAndMergeRequestIId(task);
        const product = gitLabInfo?.gitLabProject?.name || (await ClickUp.getProduct(task));
        const link = `[${product}: ${name}](${task.url})`;
        switch (mode) {
            case 'todo':
                return `- [ ] ${link}`;
            case 'dp':
                return [node_shared_1.TaskStatus.InProgress, node_shared_1.TaskStatus.DevInProgress].includes(task.status.status) && progress
                    ? `* (${(0, case_utils_1.titleCase)(task.status.status)} ${progress}) ${link}`
                    : `* (${(0, case_utils_1.titleCase)(task.status.status)}) ${link}`;
        }
    }
    getTaskProgress() {
        const path = (0, path_1.join)(config_1.CONFIG.TaskTodoFolder, this.taskId + '.md');
        if ((0, fs_1.existsSync)(path)) {
            const content = (0, fs_1.readFileSync)(path, { encoding: 'utf-8' });
            const checklist = (0, checklist_utils_1.normalizeMarkdownChecklist)(content);
            const total = checklist.length;
            const done = checklist.filter((c) => c.checked).length;
            return `${Math.round((done / total) * 100)}%`;
        }
        else {
            return null;
        }
    }
    static async getMySummarizedTasks() {
        const user = (await ClickUp.getCurrentUser()).user;
        const team = (await ClickUp.getTeams()).teams.find((t) => t.name === config_1.CONFIG.ClickUpTeam);
        if (!team) {
            console.log('Team does not exist.');
            return;
        }
        const tasks = (await ClickUp.getMyTasks(team.id, user.id)).tasks;
        const summarizedTasks = [];
        const bar = new cli_progress_1.SingleBar({
            stopOnComplete: true,
        }, cli_progress_1.Presets.shades_classic);
        bar.start(tasks.length, 0);
        for (const task of tasks) {
            const taskPath = [task];
            let currentTask = task;
            while (currentTask.parent) {
                currentTask = await new ClickUp(currentTask.parent).getTask();
                taskPath.push(currentTask);
            }
            const simpleTaskPath = taskPath.map((t) => ({
                name: t.name,
                id: t.id,
                priority: t.priority,
                due_date: t.due_date,
            }));
            const reducedTask = simpleTaskPath.reduce((a, c) => ({
                name: c.name + ' | ' + a.name,
                id: a.id,
                priority: (a.priority === null && c.priority !== null) ||
                    (a.priority !== null &&
                        c.priority !== null &&
                        parseInt(a.priority.orderindex) > parseInt(c.priority.orderindex))
                    ? c.priority
                    : a.priority,
                due_date: (a.due_date === null && c.due_date !== null) ||
                    (a.due_date !== null &&
                        c.due_date !== null &&
                        parseInt(a.due_date) > parseInt(c.due_date))
                    ? c.due_date
                    : a.due_date,
            }));
            summarizedTasks.push({
                name: reducedTask.name,
                id: task.id,
                url: task.url,
                priority: reducedTask.priority,
                due_date: reducedTask.due_date,
                original_priority: task.priority,
                original_due_date: task.due_date,
                date_created: task.date_created,
                status: task.status,
                product: await ClickUp.getProduct(task),
            });
            bar.increment(1);
        }
        return summarizedTasks;
    }
    async updateChecklist(clickUpChecklist, markdownChecklistString) {
        const markdownNormalizedChecklist = (0, checklist_utils_1.normalizeMarkdownChecklist)(markdownChecklistString, true);
        const clickUpNormalizedChecklist = (0, checklist_utils_1.normalizeClickUpChecklist)(clickUpChecklist.items);
        const actions = (0, checklist_utils_1.getSyncChecklistActions)(clickUpNormalizedChecklist, markdownNormalizedChecklist);
        if (actions.update.length + actions.create.length + actions.delete.length ===
            0) {
            return;
        }
        for (const checklistItem of actions.update) {
            await this.updateChecklistItem(clickUpChecklist.id, checklistItem.id, checklistItem.name, checklistItem.checked, checklistItem.order);
        }
        for (const checklistItem of actions.create) {
            await this.createChecklistItem(clickUpChecklist.id, checklistItem.name, checklistItem.checked, checklistItem.order);
        }
        for (const checklistItem of actions.delete) {
            await this.deleteChecklistItem(clickUpChecklist.id, checklistItem.id);
        }
    }
    async setTaskAsInProgressStatus() {
        const t = await this.getTask();
        const list = await ClickUp.getList(t.list.id);
        if (list.statuses.find((s) => s.status.toLowerCase() === node_shared_1.TaskStatus.DevInProgress)) {
            return this.setTaskStatus(node_shared_1.TaskStatus.DevInProgress);
        }
        return this.setTaskStatus(node_shared_1.TaskStatus.InProgress);
    }
    async setTaskAsInReviewStatus() {
        const t = await this.getTask();
        const list = await ClickUp.getList(t.list.id);
        if (list.statuses.find((s) => s.status.toLowerCase() === node_shared_1.TaskStatus.DevInReview)) {
            return this.setTaskStatus(node_shared_1.TaskStatus.DevInReview);
        }
        if (list.statuses.find((s) => s.status.toLowerCase() === node_shared_1.TaskStatus.InReview)) {
            return this.setTaskStatus(node_shared_1.TaskStatus.InReview);
        }
        return this.setTaskStatus(node_shared_1.TaskStatus.Review);
    }
    static async getGroups() {
        const team = (await ClickUp.getTeams()).teams.find((t) => t.name === config_1.CONFIG.ClickUpTeam);
        if (!team) {
            console.log('Team does not exist.');
            return;
        }
        return callApi('get', `/group/`, { team_id: team.id });
    }
    static async getFrontendGroupMembers() {
        return (await this.getGroups())?.groups.find((g) => g.name === 'Frontend Team')?.members;
    }
}
exports.ClickUp = ClickUp;


/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("cli-progress");

/***/ }),
/* 9 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CONFIG = exports.getConfig = exports.getConfigPath = void 0;
const tslib_1 = __webpack_require__(4);
const fs_1 = __webpack_require__(9);
const js_yaml_1 = tslib_1.__importDefault(__webpack_require__(12));
const untildify_1 = tslib_1.__importDefault(__webpack_require__(13));
function getConfigPath() {
    if (process.env.ACCEL_SHOOTER_CONFIG_FILE) {
        return (0, untildify_1.default)(process.env.ACCEL_SHOOTER_CONFIG_FILE);
    }
    else {
        throw Error('environment variable ACCEL_SHOOTER_CONFIG_FILE not found');
    }
}
exports.getConfigPath = getConfigPath;
function getConfig() {
    const configPath = getConfigPath();
    if (!fs_1.existsSync) {
        throw Error('config file does not exist');
    }
    const config = js_yaml_1.default.load((0, fs_1.readFileSync)(configPath, { encoding: 'utf-8' }));
    config.GitLabProjects = config.GitLabProjects.map((p) => ({
        ...p,
        path: (0, untildify_1.default)(p.path),
    }));
    const filePathKeys = [
        'TaskTodoFolder',
        'TaskTddStageFolder',
        'TaskTimeTrackFolder',
        'TodoFile',
        'TodoChangeNotificationFile',
        'WorkNoteFile',
        'MySummarizedTasksFile',
        'HolidayFile',
        'PersonalHolidayFile',
        'CommitScopeFile',
        'GoogleTokenFile',
        'GoogleCredentialsFile',
        'PunchInfoFile',
        'TaskInProgressTimesFolder',
        'TimingAppExportFolder',
        'TaskInProgressTimeTable',
    ];
    filePathKeys.forEach((key) => {
        config[key] = (0, untildify_1.default)(config[key]);
    });
    return config;
}
exports.getConfig = getConfig;
exports.CONFIG = getConfig();


/***/ }),
/* 12 */
/***/ ((module) => {

module.exports = require("js-yaml");

/***/ }),
/* 13 */
/***/ ((module) => {

module.exports = require("untildify");

/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.callApiFactory = void 0;
const tslib_1 = __webpack_require__(4);
const node_fetch_1 = tslib_1.__importDefault(__webpack_require__(15));
const qs_1 = tslib_1.__importDefault(__webpack_require__(16));
const config_1 = __webpack_require__(11);
const sleep_utils_1 = __webpack_require__(17);
const RETRY_SETTING = {
    retry: 5,
    pause: 12 * 1000,
};
async function fetchRetry(url, opts) {
    let retry = (opts && opts.retry) || 3;
    while (retry > 0) {
        try {
            return await (0, node_fetch_1.default)(url, opts).then(checkStatus);
        }
        catch (e) {
            if (opts?.callback) {
                opts.callback(retry);
            }
            retry = retry - 1;
            if (retry == 0) {
                throw e;
            }
            if (opts?.pause) {
                await (0, sleep_utils_1.sleep)(opts.pause);
            }
        }
    }
    return Promise.reject();
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
        throw Error('Response is undefined.');
    }
}
function callApiFactory(site) {
    let apiUrl = '';
    let headers = {};
    switch (site) {
        case 'GitLab':
            apiUrl = 'https://gitlab.com/api/v4';
            headers = { 'Private-Token': config_1.CONFIG.GitLabToken };
            break;
        case 'ClickUp':
            apiUrl = 'https://api.clickup.com/api/v2';
            headers = { Authorization: config_1.CONFIG.ClickUpToken };
            break;
        default:
            throw Error(`Site {site} is not supported.`);
    }
    return async (method, url, queryParams, body, responseText) => {
        let params;
        if (typeof body === 'object' && body) {
            params = new URLSearchParams();
            Object.entries(body).forEach(([key, value]) => {
                params.set(key, value);
            });
        }
        if (typeof body === 'string') {
            params = body;
        }
        if (queryParams) {
            url += '?' + qs_1.default.stringify(queryParams, { arrayFormat: 'brackets' });
        }
        return fetchRetry(apiUrl + url, method === 'get'
            ? {
                method,
                headers,
                ...RETRY_SETTING,
            }
            : { method, headers, body: params, ...RETRY_SETTING })
            .then((res) => (responseText ? res?.text() : res?.json()))
            .catch((error) => {
            console.log(apiUrl + url);
            throw error;
        });
    };
}
exports.callApiFactory = callApiFactory;


/***/ }),
/* 15 */
/***/ ((module) => {

module.exports = require("node-fetch");

/***/ }),
/* 16 */
/***/ ((module) => {

module.exports = require("qs");

/***/ }),
/* 17 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.sleep = void 0;
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
exports.sleep = sleep;


/***/ }),
/* 18 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.titleCase = void 0;
const KEEP_LOWERCASE_WORD_LIST = [
    'and',
    'as',
    'but',
    'for',
    'if',
    'nor',
    'or',
    'so',
    'yet',
    'a',
    'an',
    'the',
    'at',
    'by',
    'for',
    'in',
    'of',
    'off',
    'on',
    'per',
    'to',
    'up',
    'via',
];
function firstLetterCapitalize(str) {
    return str[0].toUpperCase() + str.slice(1);
}
function titleCase(str) {
    const sentence = str.toLowerCase().split(' ');
    const resultSentence = sentence.map((w, i) => {
        if (i === 0) {
            return firstLetterCapitalize(w);
        }
        if (KEEP_LOWERCASE_WORD_LIST.includes(w)) {
            return w;
        }
        return firstLetterCapitalize(w);
    });
    return resultSentence.join(' ');
}
exports.titleCase = titleCase;


/***/ }),
/* 19 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getSyncChecklistActions = exports.normalizeMarkdownChecklist = exports.normalizeClickUpChecklist = void 0;
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
function normalizeMarkdownChecklist(markdown, rootOnly = false) {
    return markdown
        .split("\n")
        .filter((line) => line && (line.includes("- [ ]") || line.includes("- [x]")))
        .map((line, index) => ({
        name: line
            .replace(/- \[[x ]\] /g, "")
            .replace(/^ +/, (space) => space.replace(/ /g, "-")),
        checked: /- \[x\]/.test(line),
        order: index,
    }))
        .filter((item) => !rootOnly || !item.name.startsWith("-"));
}
exports.normalizeMarkdownChecklist = normalizeMarkdownChecklist;
function getSyncChecklistActions(oldClickUpChecklist, newGitLabChecklist) {
    const actions = {
        update: [],
        create: [],
        delete: [],
    };
    const oldLength = oldClickUpChecklist.length;
    const newLength = newGitLabChecklist.length;
    if (newLength < oldLength) {
        actions.delete = oldClickUpChecklist.slice(newLength);
    }
    else if (newLength > oldLength) {
        actions.create = newGitLabChecklist.slice(oldLength);
    }
    const minLength = Math.min(oldLength, newLength);
    for (let i = 0; i < minLength; i++) {
        const oldItem = oldClickUpChecklist[i];
        const newItem = newGitLabChecklist[i];
        if (oldItem.checked !== newItem.checked || oldItem.name !== newItem.name) {
            actions.update.push({
                id: oldItem.id,
                ...newItem,
            });
        }
    }
    return actions;
}
exports.getSyncChecklistActions = getSyncChecklistActions;


/***/ }),
/* 20 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GitLab = void 0;
const config_1 = __webpack_require__(11);
const api_utils_1 = __webpack_require__(14);
const date_utils_1 = __webpack_require__(21);
const callApi = (0, api_utils_1.callApiFactory)('GitLab');
class GitLab {
    constructor(projectId) {
        this.projectId = projectId;
    }
    getProject() {
        return callApi('get', `/projects/${this.projectId}`);
    }
    async getDefaultBranchName() {
        const project = await this.getProject();
        return project.default_branch;
    }
    getOpenedMergeRequests() {
        return callApi('get', `/projects/${this.projectId}/merge_requests`, { state: 'opened', per_page: '100' });
    }
    static getReadyToReviewMergeRequestsByReviewer(reviewerId) {
        return callApi('get', `/merge_requests`, {
            state: 'opened',
            per_page: '100',
            reviewer_id: reviewerId,
            scope: 'all',
        });
    }
    static getMergeRequestApprovals(projectId, mergeRequestIId) {
        return callApi('get', `/projects/${projectId}/merge_requests/${mergeRequestIId}/approvals`);
    }
    getMergeRequest(mergeRequestNumber) {
        return callApi('get', `/projects/${this.projectId}/merge_requests/${mergeRequestNumber}`);
    }
    getMergeRequestNotes(mergeRequestNumber) {
        return callApi('get', `/projects/${this.projectId}/merge_requests/${mergeRequestNumber}/notes`);
    }
    getMergeRequestChanges(mergeRequestNumber) {
        return callApi('get', `/projects/${this.projectId}/merge_requests/${mergeRequestNumber}/changes`);
    }
    getCommit(sha) {
        return callApi('get', `/projects/${this.projectId}/repository/commits/${sha}`);
    }
    static async getUserByUserName(username) {
        return callApi('get', `/users`, {
            username,
        }).then((users) => users[0]);
    }
    static async getUserById(id) {
        return callApi('get', `/users/${id}`);
    }
    static getEndingAssignee() {
        if (!config_1.CONFIG.EndingAssignee) {
            throw Error('No ending assignee was set');
        }
        return this.getUserByUserName(config_1.CONFIG.EndingAssignee);
    }
    listPipelineJobs(pipelineId) {
        return callApi('get', `/projects/${this.projectId}/pipelines/${pipelineId}/jobs`);
    }
    getCompare(from, to) {
        return callApi('get', `/projects/${this.projectId}/repository/compare`, {
            from,
            to,
            straight: true,
        });
    }
    async listPipelines(query) {
        query.ref = query.ref || (await this.getDefaultBranchName());
        return callApi('get', `/projects/${this.projectId}/pipelines/`, query);
    }
    async listProjectLabels() {
        return callApi('get', `/projects/${this.projectId}/labels`, {
            per_page: 100,
        });
    }
    async createBranch(branch, targetBranch) {
        return callApi('post', `/projects/${this.projectId}/repository/branches`, null, {
            branch,
            ref: targetBranch || (await this.getDefaultBranchName()),
        });
    }
    async createMergeRequest(title, branch, description, labels, targetBranch) {
        return callApi('post', `/projects/${this.projectId}/merge_requests`, null, {
            source_branch: branch,
            target_branch: targetBranch || (await this.getDefaultBranchName()),
            title: `Draft: ${title}`,
            description,
            labels: labels.join(','),
        });
    }
    async createMergeRequestNote(merge_request, content) {
        await callApi('post', `/projects/${this.projectId}/merge_requests/${merge_request.iid}/notes`, { body: content });
    }
    async updateMergeRequestDescription(merge_request, description) {
        await callApi('put', `/projects/${this.projectId}/merge_requests/${merge_request.iid}`, null, {
            description,
        });
    }
    async markMergeRequestAsReadyAndAddAssignee(merge_request) {
        const assignee = await GitLab.getEndingAssignee();
        await callApi('put', `/projects/${this.projectId}/merge_requests/${merge_request.iid}`, null, {
            title: merge_request.title
                .replace(/WIP: /g, '')
                .replace(/Draft: /g, ''),
            assignee_id: assignee.id,
        });
    }
    async closeMergeRequest(merge_request) {
        await callApi('put', `/projects/${this.projectId}/merge_requests/${merge_request.iid}`, null, {
            state_event: 'close',
        });
    }
    async markMergeRequestAsUnreadyAndSetAssigneeToSelf(merge_request) {
        await callApi('put', `/projects/${this.projectId}/merge_requests/${merge_request.iid}`, null, {
            title: 'Draft: ' +
                merge_request.title.replace('WIP: ', '').replace('Draft: ', ''),
            assignee_id: await this.getUserId(),
        });
    }
    async getMergeRequestTemplate() {
        const defaultBranchName = await this.getDefaultBranchName();
        return callApi('get', `/projects/${this.projectId}/repository/files/%2Egitlab%2Fmerge_request_templates%2FDefault%2Emd/raw`, { ref: defaultBranchName }, undefined, true);
    }
    static async getPushedEvents(after, before) {
        return callApi('get', '/events', {
            action: 'pushed',
            before: (0, date_utils_1.formatDate)(before, date_utils_1.DateFormat.GITLAB),
            after: (0, date_utils_1.formatDate)(after, date_utils_1.DateFormat.GITLAB),
            sort: 'asc',
            per_page: 100,
        });
    }
    static async getApprovedEvents(after, before) {
        return callApi('get', '/events', {
            action: 'approved',
            before: (0, date_utils_1.formatDate)(before, date_utils_1.DateFormat.GITLAB),
            after: (0, date_utils_1.formatDate)(after, date_utils_1.DateFormat.GITLAB),
            sort: 'asc',
            per_page: 100,
        });
    }
    async fork(namespace_id, name, path) {
        return callApi('post', `/projects/${this.projectId}/fork`, {
            namespace_id,
            name,
            path,
        });
    }
    static async getNamespaces() {
        return callApi('get', '/namespaces');
    }
    async getUserId() {
        const user = await callApi('get', '/user');
        return user.id;
    }
}
exports.GitLab = GitLab;


/***/ }),
/* 21 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.formatDate = exports.DateFormat = void 0;
const date_fns_1 = __webpack_require__(22);
var DateFormat;
(function (DateFormat) {
    DateFormat["STANDARD"] = "yyyy/MM/dd";
    DateFormat["GITLAB"] = "yyyy-MM-dd";
    DateFormat["HOLIDAY"] = "yyyy/M/d";
    DateFormat["TIMING_APP"] = "yyyy/M/d";
})(DateFormat || (exports.DateFormat = DateFormat = {}));
function formatDate(day, dateFormat = DateFormat.STANDARD) {
    return (0, date_fns_1.format)(day, dateFormat);
}
exports.formatDate = formatDate;


/***/ }),
/* 22 */
/***/ ((module) => {

module.exports = require("date-fns");

/***/ }),
/* 23 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Google = void 0;
const tslib_1 = __webpack_require__(4);
const fs_1 = tslib_1.__importDefault(__webpack_require__(9));
const googleapis_1 = __webpack_require__(24);
const local_auth_1 = __webpack_require__(25);
const date_fns_1 = __webpack_require__(22);
const config_1 = __webpack_require__(11);
class Google {
    constructor() {
        this.scopes = [
            'https://www.googleapis.com/auth/calendar.readonly',
        ];
        this.tokenFile = config_1.CONFIG.GoogleTokenFile;
        this.credentialsFile = config_1.CONFIG.GoogleCredentialsFile;
    }
    async loadSavedCredentialsIfExist() {
        try {
            const content = await fs_1.default.promises.readFile(this.tokenFile, 'utf-8');
            const credentials = JSON.parse(content);
            return googleapis_1.google.auth.fromJSON(credentials);
        }
        catch (err) {
            return null;
        }
    }
    async saveCredentials(client) {
        const content = await fs_1.default.promises.readFile(this.credentialsFile, 'utf-8');
        const keys = JSON.parse(content);
        const key = keys.installed || keys.web;
        const payload = JSON.stringify({
            type: 'authorized_user',
            client_id: key.client_id,
            client_secret: key.client_secret,
            refresh_token: client.credentials.refresh_token,
        });
        await fs_1.default.promises.writeFile(this.tokenFile, payload);
    }
    async authorize() {
        const client = await this.loadSavedCredentialsIfExist();
        if (client) {
            return client;
        }
        const oauthClient = await (0, local_auth_1.authenticate)({
            scopes: this.scopes,
            keyfilePath: this.credentialsFile,
        });
        if (oauthClient.credentials) {
            await this.saveCredentials(oauthClient);
        }
        return oauthClient;
    }
    async listAttendingEvent(timeMin, timeMax) {
        try {
            const auth = (await this.authorize());
            const calendar = googleapis_1.google.calendar({ version: 'v3', auth });
            const res = await calendar.events.list({
                calendarId: 'primary',
                timeMin,
                timeMax,
                maxResults: 10,
                singleEvents: true,
                orderBy: 'startTime',
            });
            const events = res.data.items;
            const attendingEvents = events
                ?.filter((event) => {
                if (!event.attendees) {
                    return true;
                }
                const self = event.attendees.find((a) => a.self);
                return !self || self.responseStatus === 'accepted';
            })
                .map((e) => ({ ...e, isStudyGroup: false })) || [];
            const studyGroupRes = await calendar.events.list({
                calendarId: config_1.CONFIG.StudyGroupGoogleCalendarId,
                timeMin,
                timeMax,
                maxResults: 10,
                singleEvents: true,
                orderBy: 'startTime',
            });
            const studyGroupEvents = studyGroupRes.data.items?.map((e) => ({ ...e, isStudyGroup: true })) ||
                [];
            const allEvents = attendingEvents
                .filter((e) => !studyGroupEvents.some((se) => se.id === e.id))
                .concat(studyGroupEvents);
            allEvents.sort((a, b) => a.start?.dateTime && b.start?.dateTime
                ? (0, date_fns_1.parseISO)(a.start.dateTime).valueOf() -
                    (0, date_fns_1.parseISO)(b.start.dateTime).valueOf()
                : 0);
            return allEvents;
        }
        catch (e) {
            if (e.response.data.error === 'invalid_grant') {
                console.log('Invalid Grant!');
                fs_1.default.unlinkSync(this.tokenFile);
                return this.listAttendingEvent(timeMin, timeMax);
            }
            else {
                throw e;
            }
        }
    }
}
exports.Google = Google;


/***/ }),
/* 24 */
/***/ ((module) => {

module.exports = require("googleapis");

/***/ }),
/* 25 */
/***/ ((module) => {

module.exports = require("@google-cloud/local-auth");

/***/ }),
/* 26 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 27 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 28 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 29 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TaskStatus = void 0;
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["Open"] = "open";
    TaskStatus["Pending"] = "pending";
    TaskStatus["InDiscussion"] = "in discussion";
    TaskStatus["ReadyToDo"] = "ready to do";
    TaskStatus["ReadyToDev"] = "ready to dev";
    TaskStatus["InProgress"] = "in progress";
    TaskStatus["DevInProgress"] = "dev in progress";
    TaskStatus["Review"] = "review";
    TaskStatus["InReview"] = "in review";
    TaskStatus["DevInReview"] = "dev in review";
    TaskStatus["ReadyToVerify"] = "ready to verify";
    TaskStatus["Suspended"] = "suspended";
    TaskStatus["Verified"] = "verified";
    TaskStatus["Closed"] = "closed";
    TaskStatus["Complete"] = "complete";
    TaskStatus["Done"] = "done";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));


/***/ }),
/* 30 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 31 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 32 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 33 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 34 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 35 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 36 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getTaskIdFromBranchName = void 0;
function getTaskIdFromBranchName(branchName) {
    const result = branchName.match(/CU-([a-z0-9]+)/);
    return result ? result[1] : null;
}
exports.getTaskIdFromBranchName = getTaskIdFromBranchName;


/***/ }),
/* 37 */
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),
/* 38 */
/***/ ((module) => {

module.exports = require("@nestjs/serve-static");

/***/ }),
/* 39 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const tslib_1 = __webpack_require__(4);
const api_interfaces_1 = __webpack_require__(40);
const node_shared_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(37);
const fs_1 = __webpack_require__(9);
const path_1 = __webpack_require__(10);
const rxjs_1 = __webpack_require__(42);
const operators_1 = __webpack_require__(43);
const watch_rx_1 = __webpack_require__(44);
const CONFIG_KEY_MAP = {
    todo: 'TodoFile',
    work_note: 'WorkNoteFile',
};
const MARKDOWN_LINK_REGEX = /\[([\w\s]+)\]\((https?:\/\/[\w./?=#&()-]+)\)/g;
let AppController = exports.AppController = class AppController {
    constructor(configService) {
        this.configService = configService;
    }
    async getTasks() {
        const path = this.configService.get('MySummarizedTasksFile');
        const tasks = JSON.parse((0, fs_1.readFileSync)(path, { encoding: 'utf-8' }));
        return { tasks };
    }
    async getTask(taskId) {
        const clickUp = new node_shared_1.ClickUp(taskId);
        const task = await clickUp.getTask();
        return {
            task,
        };
    }
    async getTaskComments(taskId) {
        const clickUp = new node_shared_1.ClickUp(taskId);
        const comments = await clickUp.getTaskComments();
        return {
            comments,
        };
    }
    async getMarkdown(markdownId) {
        const configKey = CONFIG_KEY_MAP[markdownId];
        if (!configKey) {
            throw new common_1.NotFoundException();
        }
        const path = this.configService.get(configKey);
        const content = (0, fs_1.readFileSync)(path, { encoding: 'utf-8' });
        return { content };
    }
    async putMarkdown(markdownId, content) {
        const configKey = CONFIG_KEY_MAP[markdownId];
        if (!configKey) {
            throw new common_1.NotFoundException();
        }
        const path = this.configService.get(configKey);
        (0, fs_1.writeFileSync)(path, content);
    }
    async getChecklist(taskId) {
        const clickUp = new node_shared_1.ClickUp(taskId);
        const task = await clickUp.getTask();
        const fullTaskName = await clickUp.getFullTaskName(task);
        const { gitLabProject, mergeRequestIId } = await clickUp.getGitLabProjectAndMergeRequestIId(task);
        const gitLab = new node_shared_1.GitLab(gitLabProject.id);
        const mergeRequest = await gitLab.getMergeRequest(mergeRequestIId);
        const folderPath = this.configService.get('TaskTodoFolder');
        const path = (0, path_1.join)(folderPath, taskId + '.md');
        const content = (0, fs_1.readFileSync)(path, { encoding: 'utf-8' });
        const links = [...content.matchAll(MARKDOWN_LINK_REGEX)].map(([, name, url]) => ({
            name,
            url,
        }));
        return {
            mergeRequestLink: mergeRequest.web_url,
            taskLink: task.url,
            content,
            links,
            fullTaskName,
        };
    }
    async getTddStage(taskId) {
        const folderPath = this.configService.get('TaskTddStageFolder');
        const path = (0, path_1.join)(folderPath, taskId + '.txt');
        const stage = (0, fs_1.existsSync)(path)
            ? (0, fs_1.readFileSync)(path, { encoding: 'utf-8' }).trim()
            : api_interfaces_1.TddStage.Test;
        return { stage };
    }
    async putTddStage(taskId, stage) {
        const folderPath = this.configService.get('TaskTddStageFolder');
        const path = (0, path_1.join)(folderPath, taskId + '.txt');
        (0, fs_1.writeFileSync)(path, stage);
    }
    async putChecklist(taskId, checklist) {
        const folderPath = this.configService.get('TaskTodoFolder');
        (0, fs_1.writeFileSync)((0, path_1.join)(folderPath, taskId + '.md'), checklist);
        const clickUp = new node_shared_1.ClickUp(taskId);
        const task = await clickUp.getTask();
        const clickUpChecklist = task.checklists.find((c) => c.name.toLowerCase().includes('synced checklist'));
        if (clickUpChecklist) {
            await clickUp.updateChecklist(clickUpChecklist, checklist);
        }
    }
    async getMRFromTaskId(taskId) {
        const clickUp = new node_shared_1.ClickUp(taskId);
        const { gitLabProject, mergeRequestIId } = await clickUp.getGitLabProjectAndMergeRequestIId();
        const gitLab = new node_shared_1.GitLab(gitLabProject.id);
        return gitLab.getMergeRequest(mergeRequestIId);
    }
    async getMRDescription(taskId) {
        const mergeRequest = await this.getMRFromTaskId(taskId);
        return { content: mergeRequest.description };
    }
    async putMRDescription(taskId, content) {
        const clickUp = new node_shared_1.ClickUp(taskId);
        const { gitLabProject, mergeRequestIId } = await clickUp.getGitLabProjectAndMergeRequestIId();
        const gitLab = new node_shared_1.GitLab(gitLabProject.id);
        const mergeRequest = await gitLab.getMergeRequest(mergeRequestIId);
        await gitLab.updateMergeRequestDescription(mergeRequest, content);
    }
    async getMRPipelineStatus(taskId) {
        const mergeRequest = await this.getMRFromTaskId(taskId);
        return { content: mergeRequest.head_pipeline?.status || 'none' };
    }
    async getMRLinkStatus(taskId) {
        const clickUp = new node_shared_1.ClickUp(taskId);
        const { gitLabProject, mergeRequestIId } = await clickUp.getGitLabProjectAndMergeRequestIId();
        const gitLab = new node_shared_1.GitLab(gitLabProject.id);
        const notes = await gitLab.getMergeRequestNotes(mergeRequestIId);
        return {
            linked: notes.some((n) => n.body.startsWith('Task linked:')),
        };
    }
    todoSse() {
        return (0, watch_rx_1.watchRx)(node_shared_1.CONFIG.TodoChangeNotificationFile).pipe((0, operators_1.map)(() => (0, fs_1.readFileSync)(node_shared_1.CONFIG.TodoFile, { encoding: 'utf-8' })));
    }
};
tslib_1.__decorate([
    (0, common_1.Get)('tasks'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], AppController.prototype, "getTasks", null);
tslib_1.__decorate([
    (0, common_1.Get)('task/:id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], AppController.prototype, "getTask", null);
tslib_1.__decorate([
    (0, common_1.Get)('task/:id/comments'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], AppController.prototype, "getTaskComments", null);
tslib_1.__decorate([
    (0, common_1.Get)('markdown/:id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], AppController.prototype, "getMarkdown", null);
tslib_1.__decorate([
    (0, common_1.Put)('markdown/:id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)('content')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "putMarkdown", null);
tslib_1.__decorate([
    (0, common_1.Get)('task/:id/checklist'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], AppController.prototype, "getChecklist", null);
tslib_1.__decorate([
    (0, common_1.Get)('task/:id/tdd_stage'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], AppController.prototype, "getTddStage", null);
tslib_1.__decorate([
    (0, common_1.Put)('task/:id/tdd_stage'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)('stage')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_h = typeof api_interfaces_1.TddStage !== "undefined" && api_interfaces_1.TddStage) === "function" ? _h : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "putTddStage", null);
tslib_1.__decorate([
    (0, common_1.Put)('task/:id/checklist'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)('checklist')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "putChecklist", null);
tslib_1.__decorate([
    (0, common_1.Get)('task/:id/mr_description'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], AppController.prototype, "getMRDescription", null);
tslib_1.__decorate([
    (0, common_1.Put)('task/:id/mr_description'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)('content')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "putMRDescription", null);
tslib_1.__decorate([
    (0, common_1.Get)('task/:id/mr_pipeline_status'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_k = typeof Promise !== "undefined" && Promise) === "function" ? _k : Object)
], AppController.prototype, "getMRPipelineStatus", null);
tslib_1.__decorate([
    (0, common_1.Get)('task/:id/mr_link_status'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], AppController.prototype, "getMRLinkStatus", null);
tslib_1.__decorate([
    (0, common_1.Sse)('todo-sse'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", typeof (_m = typeof rxjs_1.Observable !== "undefined" && rxjs_1.Observable) === "function" ? _m : Object)
], AppController.prototype, "todoSse", null);
exports.AppController = AppController = tslib_1.__decorate([
    (0, common_1.Controller)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], AppController);


/***/ }),
/* 40 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(4);
tslib_1.__exportStar(__webpack_require__(41), exports);


/***/ }),
/* 41 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TddStage = void 0;
var TddStage;
(function (TddStage) {
    TddStage["Test"] = "test";
    TddStage["Code"] = "code";
    TddStage["Refactor"] = "refactor";
})(TddStage || (exports.TddStage = TddStage = {}));


/***/ }),
/* 42 */
/***/ ((module) => {

module.exports = require("rxjs");

/***/ }),
/* 43 */
/***/ ((module) => {

module.exports = require("rxjs/operators");

/***/ }),
/* 44 */
/***/ ((module) => {

module.exports = require("watch-rx");

/***/ }),
/* 45 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
let AppService = exports.AppService = class AppService {
};
exports.AppService = AppService = tslib_1.__decorate([
    (0, common_1.Injectable)()
], AppService);


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(2);
const app_module_1 = __webpack_require__(3);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);
    const port = process.env.PORT || 8112;
    await app.listen(port, () => {
        common_1.Logger.log('Listening at http://localhost:' + port + '/' + globalPrefix);
    });
}
bootstrap();

})();

var __webpack_export_target__ = exports;
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;
//# sourceMappingURL=main.js.map