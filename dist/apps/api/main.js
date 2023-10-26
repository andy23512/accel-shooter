/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./apps/api/src/app/app.controller.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const tslib_1 = __webpack_require__("tslib");
const node_shared_1 = __webpack_require__("./libs/node-shared/src/index.ts");
const common_1 = __webpack_require__("@nestjs/common");
const config_1 = __webpack_require__("@nestjs/config");
const fs_1 = __webpack_require__("fs");
const path_1 = __webpack_require__("path");
const rxjs_1 = __webpack_require__("rxjs");
const operators_1 = __webpack_require__("rxjs/operators");
const watch_rx_1 = __webpack_require__("watch-rx");
const CONFIG_KEY_MAP = {
    todo: 'TodoFile',
    work_note: 'WorkNoteFile',
};
const FIGMA_REGEX = /(?:https:\/\/)?(?:www\.)?figma\.com\/(file|proto)\/([0-9a-zA-Z]{22,128})(?:\/([^\?\n\r\/]+)?((?:\?[^\/]*?node-id=([^&\n\r\/]+))?[^\/]*?)(\/duplicate)?)?/g;
let AppController = class AppController {
    constructor(configService) {
        this.configService = configService;
    }
    getTasks() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const path = this.configService.get('MySummarizedTasksFile');
            const tasks = JSON.parse((0, fs_1.readFileSync)(path, { encoding: 'utf-8' }));
            return { tasks };
        });
    }
    getMarkdown(markdownId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const configKey = CONFIG_KEY_MAP[markdownId];
            if (!configKey) {
                throw new common_1.NotFoundException();
            }
            const path = this.configService.get(configKey);
            const content = (0, fs_1.readFileSync)(path, { encoding: 'utf-8' });
            return { content };
        });
    }
    putMarkdown(markdownId, content) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const configKey = CONFIG_KEY_MAP[markdownId];
            if (!configKey) {
                throw new common_1.NotFoundException();
            }
            const path = this.configService.get(configKey);
            (0, fs_1.writeFileSync)(path, content);
        });
    }
    getChecklist(taskId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const clickUp = new node_shared_1.ClickUp(taskId);
            const task = yield clickUp.getTask();
            const fullTaskName = yield clickUp.getFullTaskName(task);
            const frameUrls = yield clickUp.getFrameUrls(task);
            const { gitLabProject, mergeRequestIId } = yield clickUp.getGitLabProjectAndMergeRequestIId(task);
            const gitLab = new node_shared_1.GitLab(gitLabProject.id);
            const mergeRequest = yield gitLab.getMergeRequest(mergeRequestIId);
            const folderPath = this.configService.get('TaskTodoFolder');
            const path = (0, path_1.join)(folderPath, taskId + '.md');
            const content = (0, fs_1.readFileSync)(path, { encoding: 'utf-8' });
            [...content.matchAll(FIGMA_REGEX)].forEach(([url]) => {
                frameUrls.push(url);
            });
            return {
                mergeRequestLink: mergeRequest.web_url,
                taskLink: task.url,
                content,
                frameUrl: frameUrls.length ? frameUrls[0] : null,
                fullTaskName,
            };
        });
    }
    putChecklist(taskId, checklist) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const folderPath = this.configService.get('TaskTodoFolder');
            (0, fs_1.writeFileSync)((0, path_1.join)(folderPath, taskId + '.md'), checklist);
            const clickUp = new node_shared_1.ClickUp(taskId);
            const task = yield clickUp.getTask();
            const clickUpChecklist = task.checklists.find((c) => c.name.toLowerCase().includes('synced checklist'));
            if (clickUpChecklist) {
                yield clickUp.updateChecklist(clickUpChecklist, checklist);
            }
        });
    }
    getMRFromTaskId(taskId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const clickUp = new node_shared_1.ClickUp(taskId);
            const { gitLabProject, mergeRequestIId } = yield clickUp.getGitLabProjectAndMergeRequestIId();
            const gitLab = new node_shared_1.GitLab(gitLabProject.id);
            return gitLab.getMergeRequest(mergeRequestIId);
        });
    }
    getMRDescription(taskId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const mergeRequest = yield this.getMRFromTaskId(taskId);
            return { content: mergeRequest.description };
        });
    }
    putMRDescription(taskId, content) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const clickUp = new node_shared_1.ClickUp(taskId);
            const { gitLabProject, mergeRequestIId } = yield clickUp.getGitLabProjectAndMergeRequestIId();
            const gitLab = new node_shared_1.GitLab(gitLabProject.id);
            const mergeRequest = yield gitLab.getMergeRequest(mergeRequestIId);
            yield gitLab.updateMergeRequestDescription(mergeRequest, content);
        });
    }
    getMRPipelineStatus(taskId) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const mergeRequest = yield this.getMRFromTaskId(taskId);
            return { content: ((_a = mergeRequest.head_pipeline) === null || _a === void 0 ? void 0 : _a.status) || 'none' };
        });
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
    (0, common_1.Get)('markdown/:id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
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
    tslib_1.__metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], AppController.prototype, "getChecklist", null);
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
    tslib_1.__metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
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
    tslib_1.__metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], AppController.prototype, "getMRPipelineStatus", null);
tslib_1.__decorate([
    (0, common_1.Sse)('todo-sse'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", typeof (_g = typeof rxjs_1.Observable !== "undefined" && rxjs_1.Observable) === "function" ? _g : Object)
], AppController.prototype, "todoSse", null);
AppController = tslib_1.__decorate([
    (0, common_1.Controller)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], AppController);
exports.AppController = AppController;


/***/ }),

/***/ "./apps/api/src/app/app.module.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const tslib_1 = __webpack_require__("tslib");
const node_shared_1 = __webpack_require__("./libs/node-shared/src/index.ts");
const common_1 = __webpack_require__("@nestjs/common");
const config_1 = __webpack_require__("@nestjs/config");
const serve_static_1 = __webpack_require__("@nestjs/serve-static");
const path_1 = __webpack_require__("path");
const app_controller_1 = __webpack_require__("./apps/api/src/app/app.controller.ts");
const app_service_1 = __webpack_require__("./apps/api/src/app/app.service.ts");
let AppModule = class AppModule {
};
AppModule = tslib_1.__decorate([
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
exports.AppModule = AppModule;


/***/ }),

/***/ "./apps/api/src/app/app.service.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const tslib_1 = __webpack_require__("tslib");
const common_1 = __webpack_require__("@nestjs/common");
let AppService = class AppService {
};
AppService = tslib_1.__decorate([
    (0, common_1.Injectable)()
], AppService);
exports.AppService = AppService;


/***/ }),

/***/ "./libs/node-shared/src/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./libs/node-shared/src/lib/node-shared.ts"), exports);


/***/ }),

/***/ "./libs/node-shared/src/lib/classes/clickup.class.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ClickUp = void 0;
const tslib_1 = __webpack_require__("tslib");
const cli_progress_1 = __webpack_require__("cli-progress");
const fs_1 = __webpack_require__("fs");
const path_1 = __webpack_require__("path");
const config_1 = __webpack_require__("./libs/node-shared/src/lib/config.ts");
const node_shared_1 = __webpack_require__("./libs/node-shared/src/lib/node-shared.ts");
const api_utils_1 = __webpack_require__("./libs/node-shared/src/lib/utils/api.utils.ts");
const case_utils_1 = __webpack_require__("./libs/node-shared/src/lib/utils/case.utils.ts");
const checklist_utils_1 = __webpack_require__("./libs/node-shared/src/lib/utils/checklist.utils.ts");
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
    static getProduct(task) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const space = yield ClickUp.getSpace(task.space.id);
            if (space.name === 'Product Team') {
                const list = yield ClickUp.getList(task.list.id);
                if (list.folder.name === 'Product Request Mgmt') {
                    return list.name;
                }
                const productField = (_a = task.custom_fields) === null || _a === void 0 ? void 0 : _a.find((f) => f.name === 'Product');
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
        });
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
    getFrameUrls(task) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let t = task || (yield this.getTask());
            let rootTaskId = this.taskId;
            const frameUrls = [];
            while (t.parent) {
                t = yield new ClickUp(t.parent).getTask();
                rootTaskId = t.id;
            }
            const taskQueue = [rootTaskId, this.taskId];
            while (taskQueue.length > 0) {
                const taskId = taskQueue.shift();
                const clickUp = new ClickUp(taskId);
                const task = yield clickUp.getTask();
                if (task.description) {
                    [...task.description.matchAll(FIGMA_REGEX)].forEach(([url]) => {
                        frameUrls.push(url);
                    });
                }
                const comments = yield clickUp.getTaskComments();
                comments.forEach((co) => {
                    co.comment
                        .filter((c) => c.type === 'frame')
                        .forEach((c) => {
                        var _a;
                        if ((_a = c === null || c === void 0 ? void 0 : c.frame) === null || _a === void 0 ? void 0 : _a.url) {
                            frameUrls.push(c.frame.url);
                        }
                    });
                    co.comment
                        .filter((c) => { var _a; return c.type === 'bookmark' && ((_a = c.bookmark) === null || _a === void 0 ? void 0 : _a.service) === 'figma'; })
                        .forEach((c) => {
                        var _a;
                        if ((_a = c === null || c === void 0 ? void 0 : c.bookmark) === null || _a === void 0 ? void 0 : _a.url) {
                            frameUrls.push(c.bookmark.url);
                        }
                    });
                });
            }
            return frameUrls;
        });
    }
    getGitLabProjectAndMergeRequestIId(task) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const t = task || (yield this.getTask());
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
        });
    }
    getFullTaskName(task) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let t = task || (yield this.getTask());
            let result = t.name;
            while (t.parent) {
                t = yield new ClickUp(t.parent).getTask();
                result = `${t.name} - ${result}`;
            }
            return result;
        });
    }
    getTaskString(mode) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const task = yield this.getTask();
            const name = yield this.getFullTaskName(task);
            const progress = this.getTaskProgress();
            const gitLabInfo = yield this.getGitLabProjectAndMergeRequestIId(task);
            const product = ((_a = gitLabInfo === null || gitLabInfo === void 0 ? void 0 : gitLabInfo.gitLabProject) === null || _a === void 0 ? void 0 : _a.name) || (yield ClickUp.getProduct(task));
            const link = `[${product}: ${name}](${task.url})`;
            switch (mode) {
                case 'todo':
                    return `- [ ] ${link}`;
                case 'dp':
                    return [node_shared_1.TaskStatus.InProgress, node_shared_1.TaskStatus.DevInProgress].includes(task.status.status) && progress
                        ? `* (${(0, case_utils_1.titleCase)(task.status.status)} ${progress}) ${link}`
                        : `* (${(0, case_utils_1.titleCase)(task.status.status)}) ${link}`;
            }
        });
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
    static getMySummarizedTasks() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const user = (yield ClickUp.getCurrentUser()).user;
            const team = (yield ClickUp.getTeams()).teams.find((t) => t.name === config_1.CONFIG.ClickUpTeam);
            if (!team) {
                console.log('Team does not exist.');
                return;
            }
            const tasks = (yield ClickUp.getMyTasks(team.id, user.id)).tasks;
            const summarizedTasks = [];
            const bar = new cli_progress_1.SingleBar({
                stopOnComplete: true,
            }, cli_progress_1.Presets.shades_classic);
            bar.start(tasks.length, 0);
            for (const task of tasks) {
                const taskPath = [task];
                let currentTask = task;
                while (currentTask.parent) {
                    currentTask = yield new ClickUp(currentTask.parent).getTask();
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
                    product: yield ClickUp.getProduct(task),
                });
                bar.increment(1);
            }
            return summarizedTasks;
        });
    }
    updateChecklist(clickUpChecklist, markdownChecklistString) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const markdownNormalizedChecklist = (0, checklist_utils_1.normalizeMarkdownChecklist)(markdownChecklistString, true);
            const clickUpNormalizedChecklist = (0, checklist_utils_1.normalizeClickUpChecklist)(clickUpChecklist.items);
            const actions = (0, checklist_utils_1.getSyncChecklistActions)(clickUpNormalizedChecklist, markdownNormalizedChecklist);
            if (actions.update.length + actions.create.length + actions.delete.length ===
                0) {
                return;
            }
            for (const checklistItem of actions.update) {
                yield this.updateChecklistItem(clickUpChecklist.id, checklistItem.id, checklistItem.name, checklistItem.checked, checklistItem.order);
            }
            for (const checklistItem of actions.create) {
                yield this.createChecklistItem(clickUpChecklist.id, checklistItem.name, checklistItem.checked, checklistItem.order);
            }
            for (const checklistItem of actions.delete) {
                yield this.deleteChecklistItem(clickUpChecklist.id, checklistItem.id);
            }
        });
    }
    setTaskAsInProgressStatus() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const t = yield this.getTask();
            const list = yield ClickUp.getList(t.list.id);
            if (list.statuses.find((s) => s.status.toLowerCase() === node_shared_1.TaskStatus.DevInProgress)) {
                return this.setTaskStatus(node_shared_1.TaskStatus.DevInProgress);
            }
            return this.setTaskStatus(node_shared_1.TaskStatus.InProgress);
        });
    }
    setTaskAsInReviewStatus() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const t = yield this.getTask();
            const list = yield ClickUp.getList(t.list.id);
            if (list.statuses.find((s) => s.status.toLowerCase() === node_shared_1.TaskStatus.DevInReview)) {
                return this.setTaskStatus(node_shared_1.TaskStatus.DevInReview);
            }
            if (list.statuses.find((s) => s.status.toLowerCase() === node_shared_1.TaskStatus.InReview)) {
                return this.setTaskStatus(node_shared_1.TaskStatus.InReview);
            }
            return this.setTaskStatus(node_shared_1.TaskStatus.Review);
        });
    }
    static getGroups() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const team = (yield ClickUp.getTeams()).teams.find((t) => t.name === config_1.CONFIG.ClickUpTeam);
            if (!team) {
                console.log('Team does not exist.');
                return;
            }
            return callApi('get', `/group/`, { team_id: team.id });
        });
    }
    static getFrontendGroupMembers() {
        var _a, _b;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return (_b = (_a = (yield this.getGroups())) === null || _a === void 0 ? void 0 : _a.groups.find((g) => g.name === 'Frontend Team')) === null || _b === void 0 ? void 0 : _b.members;
        });
    }
}
exports.ClickUp = ClickUp;


/***/ }),

/***/ "./libs/node-shared/src/lib/classes/gitlab.class.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GitLab = void 0;
const tslib_1 = __webpack_require__("tslib");
const config_1 = __webpack_require__("./libs/node-shared/src/lib/config.ts");
const api_utils_1 = __webpack_require__("./libs/node-shared/src/lib/utils/api.utils.ts");
const date_utils_1 = __webpack_require__("./libs/node-shared/src/lib/utils/date.utils.ts");
const callApi = (0, api_utils_1.callApiFactory)('GitLab');
class GitLab {
    constructor(projectId) {
        this.projectId = projectId;
    }
    getProject() {
        return callApi('get', `/projects/${this.projectId}`);
    }
    getDefaultBranchName() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const project = yield this.getProject();
            return project.default_branch;
        });
    }
    getOpenedMergeRequests() {
        return callApi('get', `/projects/${this.projectId}/merge_requests`, { state: 'opened', per_page: '100' });
    }
    static getReadyToReviewMergeRequestsByReviewer(reviewerId) {
        return callApi('get', `/merge_requests`, {
            state: 'opened',
            per_page: '100',
            reviewer_id: reviewerId,
            wip: 'no',
        });
    }
    static getMergeRequestApprovals(projectId, mergeRequestIId) {
        return callApi('get', `/projects/${projectId}/merge_requests/${mergeRequestIId}/approvals`);
    }
    getMergeRequest(mergeRequestNumber) {
        return callApi('get', `/projects/${this.projectId}/merge_requests/${mergeRequestNumber}`);
    }
    getMergeRequestChanges(mergeRequestNumber) {
        return callApi('get', `/projects/${this.projectId}/merge_requests/${mergeRequestNumber}/changes`);
    }
    getCommit(sha) {
        return callApi('get', `/projects/${this.projectId}/repository/commits/${sha}`);
    }
    static getUserByUserName(username) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return callApi('get', `/users`, {
                username,
            }).then((users) => users[0]);
        });
    }
    static getUserById(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return callApi('get', `/users/${id}`);
        });
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
    listPipelines(query) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            query.ref = query.ref || (yield this.getDefaultBranchName());
            return callApi('get', `/projects/${this.projectId}/pipelines/`, query);
        });
    }
    listProjectLabels() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return callApi('get', `/projects/${this.projectId}/labels`, {
                per_page: 100,
            });
        });
    }
    createBranch(branch, targetBranch) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return callApi('post', `/projects/${this.projectId}/repository/branches`, null, {
                branch,
                ref: targetBranch || (yield this.getDefaultBranchName()),
            });
        });
    }
    createMergeRequest(title, branch, description, labels, targetBranch) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return callApi('post', `/projects/${this.projectId}/merge_requests`, null, {
                source_branch: branch,
                target_branch: targetBranch || (yield this.getDefaultBranchName()),
                title: `Draft: ${title}`,
                description,
                labels: labels.join(','),
            });
        });
    }
    createMergeRequestNote(merge_request, content) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield callApi('post', `/projects/${this.projectId}/merge_requests/${merge_request.iid}/notes`, { body: content });
        });
    }
    updateMergeRequestDescription(merge_request, description) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield callApi('put', `/projects/${this.projectId}/merge_requests/${merge_request.iid}`, null, {
                description,
            });
        });
    }
    markMergeRequestAsReadyAndAddAssignee(merge_request) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const assignee = yield GitLab.getEndingAssignee();
            yield callApi('put', `/projects/${this.projectId}/merge_requests/${merge_request.iid}`, null, {
                title: merge_request.title
                    .replace(/WIP: /g, '')
                    .replace(/Draft: /g, ''),
                assignee_id: assignee.id,
            });
        });
    }
    closeMergeRequest(merge_request) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield callApi('put', `/projects/${this.projectId}/merge_requests/${merge_request.iid}`, null, {
                state_event: 'close',
            });
        });
    }
    markMergeRequestAsUnreadyAndSetAssigneeToSelf(merge_request) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield callApi('put', `/projects/${this.projectId}/merge_requests/${merge_request.iid}`, null, {
                title: 'Draft: ' +
                    merge_request.title.replace('WIP: ', '').replace('Draft: ', ''),
                assignee_id: yield this.getUserId(),
            });
        });
    }
    getMergeRequestTemplate() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const defaultBranchName = yield this.getDefaultBranchName();
            return callApi('get', `/projects/${this.projectId}/repository/files/%2Egitlab%2Fmerge_request_templates%2FDefault%2Emd/raw`, { ref: defaultBranchName }, undefined, true);
        });
    }
    static getPushedEvents(after, before) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return callApi('get', '/events', {
                action: 'pushed',
                before: (0, date_utils_1.formatDate)(before, date_utils_1.DateFormat.GITLAB),
                after: (0, date_utils_1.formatDate)(after, date_utils_1.DateFormat.GITLAB),
                sort: 'asc',
                per_page: 100,
            });
        });
    }
    static getApprovedEvents(after, before) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return callApi('get', '/events', {
                action: 'approved',
                before: (0, date_utils_1.formatDate)(before, date_utils_1.DateFormat.GITLAB),
                after: (0, date_utils_1.formatDate)(after, date_utils_1.DateFormat.GITLAB),
                sort: 'asc',
                per_page: 100,
            });
        });
    }
    fork(namespace_id, name, path) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return callApi('post', `/projects/${this.projectId}/fork`, {
                namespace_id,
                name,
                path,
            });
        });
    }
    static getNamespaces() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return callApi('get', '/namespaces');
        });
    }
    getUserId() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const user = yield callApi('get', '/user');
            return user.id;
        });
    }
}
exports.GitLab = GitLab;


/***/ }),

/***/ "./libs/node-shared/src/lib/classes/google.class.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Google = void 0;
const tslib_1 = __webpack_require__("tslib");
const fs_1 = tslib_1.__importDefault(__webpack_require__("fs"));
const googleapis_1 = __webpack_require__("googleapis");
const local_auth_1 = __webpack_require__("@google-cloud/local-auth");
const date_fns_1 = __webpack_require__("date-fns");
const config_1 = __webpack_require__("./libs/node-shared/src/lib/config.ts");
class Google {
    constructor() {
        this.scopes = [
            'https://www.googleapis.com/auth/calendar.readonly',
        ];
        this.tokenFile = config_1.CONFIG.GoogleTokenFile;
        this.credentialsFile = config_1.CONFIG.GoogleCredentialsFile;
    }
    loadSavedCredentialsIfExist() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const content = yield fs_1.default.promises.readFile(this.tokenFile, 'utf-8');
                const credentials = JSON.parse(content);
                return googleapis_1.google.auth.fromJSON(credentials);
            }
            catch (err) {
                return null;
            }
        });
    }
    saveCredentials(client) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const content = yield fs_1.default.promises.readFile(this.credentialsFile, 'utf-8');
            const keys = JSON.parse(content);
            const key = keys.installed || keys.web;
            const payload = JSON.stringify({
                type: 'authorized_user',
                client_id: key.client_id,
                client_secret: key.client_secret,
                refresh_token: client.credentials.refresh_token,
            });
            yield fs_1.default.promises.writeFile(this.tokenFile, payload);
        });
    }
    authorize() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let client = yield this.loadSavedCredentialsIfExist();
            if (client) {
                return client;
            }
            client = (yield (0, local_auth_1.authenticate)({
                scopes: this.scopes,
                keyfilePath: this.credentialsFile,
            }));
            if (client.credentials) {
                yield this.saveCredentials(client);
            }
            return client;
        });
    }
    listAttendingEvent(timeMin, timeMax) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const auth = yield this.authorize();
                const calendar = googleapis_1.google.calendar({ version: 'v3', auth });
                const res = yield calendar.events.list({
                    calendarId: 'primary',
                    timeMin,
                    timeMax,
                    maxResults: 10,
                    singleEvents: true,
                    orderBy: 'startTime',
                });
                const events = res.data.items;
                const attendingEvents = (events === null || events === void 0 ? void 0 : events.filter((event) => {
                    if (!event.attendees) {
                        return true;
                    }
                    const self = event.attendees.find((a) => a.self);
                    return !self || self.responseStatus === 'accepted';
                }).map((e) => (Object.assign(Object.assign({}, e), { isStudyGroup: false })))) || [];
                const studyGroupRes = yield calendar.events.list({
                    calendarId: config_1.CONFIG.StudyGroupGoogleCalendarId,
                    timeMin,
                    timeMax,
                    maxResults: 10,
                    singleEvents: true,
                    orderBy: 'startTime',
                });
                const studyGroupEvents = ((_a = studyGroupRes.data.items) === null || _a === void 0 ? void 0 : _a.map((e) => (Object.assign(Object.assign({}, e), { isStudyGroup: true })))) ||
                    [];
                const allEvents = attendingEvents
                    .filter((e) => !studyGroupEvents.some((se) => se.id === e.id))
                    .concat(studyGroupEvents);
                allEvents.sort((a, b) => {
                    var _a, _b;
                    return ((_a = a.start) === null || _a === void 0 ? void 0 : _a.dateTime) && ((_b = b.start) === null || _b === void 0 ? void 0 : _b.dateTime)
                        ? (0, date_fns_1.parseISO)(a.start.dateTime).valueOf() -
                            (0, date_fns_1.parseISO)(b.start.dateTime).valueOf()
                        : 0;
                });
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
        });
    }
}
exports.Google = Google;


/***/ }),

/***/ "./libs/node-shared/src/lib/config.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CONFIG = exports.getConfig = exports.getConfigPath = void 0;
const tslib_1 = __webpack_require__("tslib");
const fs_1 = __webpack_require__("fs");
const js_yaml_1 = tslib_1.__importDefault(__webpack_require__("js-yaml"));
const untildify_1 = tslib_1.__importDefault(__webpack_require__("untildify"));
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
    config.GitLabProjects = config.GitLabProjects.map((p) => (Object.assign(Object.assign({}, p), { path: (0, untildify_1.default)(p.path) })));
    const filePathKeys = [
        'TaskTodoFolder',
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

/***/ "./libs/node-shared/src/lib/models/clickup/checklist.models.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./libs/node-shared/src/lib/models/clickup/space.models.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./libs/node-shared/src/lib/models/clickup/task-status.enum.ts":
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
})(TaskStatus = exports.TaskStatus || (exports.TaskStatus = {}));


/***/ }),

/***/ "./libs/node-shared/src/lib/models/clickup/task.models.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./libs/node-shared/src/lib/models/clickup/user.models.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./libs/node-shared/src/lib/models/gitlab/approval.models.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./libs/node-shared/src/lib/models/gitlab/job.models.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./libs/node-shared/src/lib/models/gitlab/merge-request.models.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./libs/node-shared/src/lib/models/models.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./libs/node-shared/src/lib/node-shared.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.sleep = exports.formatDate = exports.DateFormat = exports.getTaskIdFromBranchName = exports.normalizeMarkdownChecklist = exports.normalizeClickUpChecklist = exports.getSyncChecklistActions = exports.titleCase = exports.ProjectCheckItem = exports.NormalizedChecklist = exports.IHoliday = exports.GitLabProject = exports.FullMergeRequest = exports.Change = exports.Job = exports.Approval = exports.ClickUpUser = exports.Task = exports.TaskStatus = exports.Space = exports.ChecklistItem = exports.getConfig = exports.CONFIG = exports.Google = exports.GitLab = exports.ClickUp = void 0;
var clickup_class_1 = __webpack_require__("./libs/node-shared/src/lib/classes/clickup.class.ts");
Object.defineProperty(exports, "ClickUp", ({ enumerable: true, get: function () { return clickup_class_1.ClickUp; } }));
var gitlab_class_1 = __webpack_require__("./libs/node-shared/src/lib/classes/gitlab.class.ts");
Object.defineProperty(exports, "GitLab", ({ enumerable: true, get: function () { return gitlab_class_1.GitLab; } }));
var google_class_1 = __webpack_require__("./libs/node-shared/src/lib/classes/google.class.ts");
Object.defineProperty(exports, "Google", ({ enumerable: true, get: function () { return google_class_1.Google; } }));
var config_1 = __webpack_require__("./libs/node-shared/src/lib/config.ts");
Object.defineProperty(exports, "CONFIG", ({ enumerable: true, get: function () { return config_1.CONFIG; } }));
Object.defineProperty(exports, "getConfig", ({ enumerable: true, get: function () { return config_1.getConfig; } }));
var checklist_models_1 = __webpack_require__("./libs/node-shared/src/lib/models/clickup/checklist.models.ts");
Object.defineProperty(exports, "ChecklistItem", ({ enumerable: true, get: function () { return checklist_models_1.ChecklistItem; } }));
var space_models_1 = __webpack_require__("./libs/node-shared/src/lib/models/clickup/space.models.ts");
Object.defineProperty(exports, "Space", ({ enumerable: true, get: function () { return space_models_1.Space; } }));
var task_status_enum_1 = __webpack_require__("./libs/node-shared/src/lib/models/clickup/task-status.enum.ts");
Object.defineProperty(exports, "TaskStatus", ({ enumerable: true, get: function () { return task_status_enum_1.TaskStatus; } }));
var task_models_1 = __webpack_require__("./libs/node-shared/src/lib/models/clickup/task.models.ts");
Object.defineProperty(exports, "Task", ({ enumerable: true, get: function () { return task_models_1.Task; } }));
var user_models_1 = __webpack_require__("./libs/node-shared/src/lib/models/clickup/user.models.ts");
Object.defineProperty(exports, "ClickUpUser", ({ enumerable: true, get: function () { return user_models_1.User; } }));
var approval_models_1 = __webpack_require__("./libs/node-shared/src/lib/models/gitlab/approval.models.ts");
Object.defineProperty(exports, "Approval", ({ enumerable: true, get: function () { return approval_models_1.Approval; } }));
var job_models_1 = __webpack_require__("./libs/node-shared/src/lib/models/gitlab/job.models.ts");
Object.defineProperty(exports, "Job", ({ enumerable: true, get: function () { return job_models_1.Job; } }));
var merge_request_models_1 = __webpack_require__("./libs/node-shared/src/lib/models/gitlab/merge-request.models.ts");
Object.defineProperty(exports, "Change", ({ enumerable: true, get: function () { return merge_request_models_1.Change; } }));
Object.defineProperty(exports, "FullMergeRequest", ({ enumerable: true, get: function () { return merge_request_models_1.FullMergeRequest; } }));
var models_1 = __webpack_require__("./libs/node-shared/src/lib/models/models.ts");
Object.defineProperty(exports, "GitLabProject", ({ enumerable: true, get: function () { return models_1.GitLabProject; } }));
Object.defineProperty(exports, "IHoliday", ({ enumerable: true, get: function () { return models_1.IHoliday; } }));
Object.defineProperty(exports, "NormalizedChecklist", ({ enumerable: true, get: function () { return models_1.NormalizedChecklist; } }));
Object.defineProperty(exports, "ProjectCheckItem", ({ enumerable: true, get: function () { return models_1.ProjectCheckItem; } }));
var case_utils_1 = __webpack_require__("./libs/node-shared/src/lib/utils/case.utils.ts");
Object.defineProperty(exports, "titleCase", ({ enumerable: true, get: function () { return case_utils_1.titleCase; } }));
var checklist_utils_1 = __webpack_require__("./libs/node-shared/src/lib/utils/checklist.utils.ts");
Object.defineProperty(exports, "getSyncChecklistActions", ({ enumerable: true, get: function () { return checklist_utils_1.getSyncChecklistActions; } }));
Object.defineProperty(exports, "normalizeClickUpChecklist", ({ enumerable: true, get: function () { return checklist_utils_1.normalizeClickUpChecklist; } }));
Object.defineProperty(exports, "normalizeMarkdownChecklist", ({ enumerable: true, get: function () { return checklist_utils_1.normalizeMarkdownChecklist; } }));
var clickup_utils_1 = __webpack_require__("./libs/node-shared/src/lib/utils/clickup.utils.ts");
Object.defineProperty(exports, "getTaskIdFromBranchName", ({ enumerable: true, get: function () { return clickup_utils_1.getTaskIdFromBranchName; } }));
var date_utils_1 = __webpack_require__("./libs/node-shared/src/lib/utils/date.utils.ts");
Object.defineProperty(exports, "DateFormat", ({ enumerable: true, get: function () { return date_utils_1.DateFormat; } }));
Object.defineProperty(exports, "formatDate", ({ enumerable: true, get: function () { return date_utils_1.formatDate; } }));
var sleep_utils_1 = __webpack_require__("./libs/node-shared/src/lib/utils/sleep.utils.ts");
Object.defineProperty(exports, "sleep", ({ enumerable: true, get: function () { return sleep_utils_1.sleep; } }));


/***/ }),

/***/ "./libs/node-shared/src/lib/utils/api.utils.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.callApiFactory = void 0;
const tslib_1 = __webpack_require__("tslib");
const node_fetch_1 = tslib_1.__importDefault(__webpack_require__("node-fetch"));
const qs_1 = tslib_1.__importDefault(__webpack_require__("qs"));
const config_1 = __webpack_require__("./libs/node-shared/src/lib/config.ts");
const sleep_utils_1 = __webpack_require__("./libs/node-shared/src/lib/utils/sleep.utils.ts");
const RETRY_SETTING = {
    retry: 5,
    pause: 12 * 1000,
};
function fetchRetry(url, opts) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let retry = (opts && opts.retry) || 3;
        while (retry > 0) {
            try {
                return yield (0, node_fetch_1.default)(url, opts).then(checkStatus);
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
                    yield (0, sleep_utils_1.sleep)(opts.pause);
                }
            }
        }
        return Promise.reject();
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
    return (method, url, queryParams, body, responseText) => tslib_1.__awaiter(this, void 0, void 0, function* () {
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
            ? Object.assign({ method,
                headers }, RETRY_SETTING) : Object.assign({ method, headers, body: params }, RETRY_SETTING))
            .then((res) => (responseText ? res === null || res === void 0 ? void 0 : res.text() : res === null || res === void 0 ? void 0 : res.json()))
            .catch((error) => {
            console.log(apiUrl + url);
            throw error;
        });
    });
}
exports.callApiFactory = callApiFactory;


/***/ }),

/***/ "./libs/node-shared/src/lib/utils/case.utils.ts":
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

/***/ "./libs/node-shared/src/lib/utils/checklist.utils.ts":
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
            actions.update.push(Object.assign({ id: oldItem.id }, newItem));
        }
    }
    return actions;
}
exports.getSyncChecklistActions = getSyncChecklistActions;


/***/ }),

/***/ "./libs/node-shared/src/lib/utils/clickup.utils.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getTaskIdFromBranchName = void 0;
function getTaskIdFromBranchName(branchName) {
    const result = branchName.match(/CU-([a-z0-9]+)/);
    return result ? result[1] : null;
}
exports.getTaskIdFromBranchName = getTaskIdFromBranchName;


/***/ }),

/***/ "./libs/node-shared/src/lib/utils/date.utils.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.formatDate = exports.DateFormat = void 0;
const date_fns_1 = __webpack_require__("date-fns");
var DateFormat;
(function (DateFormat) {
    DateFormat["STANDARD"] = "yyyy/MM/dd";
    DateFormat["GITLAB"] = "yyyy-MM-dd";
    DateFormat["HOLIDAY"] = "yyyy/M/d";
    DateFormat["TIMING_APP"] = "yyyy/M/d";
})(DateFormat = exports.DateFormat || (exports.DateFormat = {}));
function formatDate(day, dateFormat = DateFormat.STANDARD) {
    return (0, date_fns_1.format)(day, dateFormat);
}
exports.formatDate = formatDate;


/***/ }),

/***/ "./libs/node-shared/src/lib/utils/sleep.utils.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.sleep = void 0;
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
exports.sleep = sleep;


/***/ }),

/***/ "@google-cloud/local-auth":
/***/ ((module) => {

module.exports = require("@google-cloud/local-auth");

/***/ }),

/***/ "@nestjs/common":
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),

/***/ "@nestjs/config":
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),

/***/ "@nestjs/core":
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),

/***/ "@nestjs/serve-static":
/***/ ((module) => {

module.exports = require("@nestjs/serve-static");

/***/ }),

/***/ "cli-progress":
/***/ ((module) => {

module.exports = require("cli-progress");

/***/ }),

/***/ "date-fns":
/***/ ((module) => {

module.exports = require("date-fns");

/***/ }),

/***/ "fs":
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "googleapis":
/***/ ((module) => {

module.exports = require("googleapis");

/***/ }),

/***/ "js-yaml":
/***/ ((module) => {

module.exports = require("js-yaml");

/***/ }),

/***/ "node-fetch":
/***/ ((module) => {

module.exports = require("node-fetch");

/***/ }),

/***/ "qs":
/***/ ((module) => {

module.exports = require("qs");

/***/ }),

/***/ "rxjs":
/***/ ((module) => {

module.exports = require("rxjs");

/***/ }),

/***/ "rxjs/operators":
/***/ ((module) => {

module.exports = require("rxjs/operators");

/***/ }),

/***/ "tslib":
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),

/***/ "untildify":
/***/ ((module) => {

module.exports = require("untildify");

/***/ }),

/***/ "watch-rx":
/***/ ((module) => {

module.exports = require("watch-rx");

/***/ }),

/***/ "path":
/***/ ((module) => {

module.exports = require("path");

/***/ })

/******/ 	});
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
const tslib_1 = __webpack_require__("tslib");
const common_1 = __webpack_require__("@nestjs/common");
const core_1 = __webpack_require__("@nestjs/core");
const app_module_1 = __webpack_require__("./apps/api/src/app/app.module.ts");
function bootstrap() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const app = yield core_1.NestFactory.create(app_module_1.AppModule);
        const globalPrefix = 'api';
        app.setGlobalPrefix(globalPrefix);
        const port = process.env.PORT || 8112;
        yield app.listen(port, () => {
            common_1.Logger.log('Listening at http://localhost:' + port + '/' + globalPrefix);
        });
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