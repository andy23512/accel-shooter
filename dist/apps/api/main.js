(function(e, a) { for(var i in a) e[i] = a[i]; }(exports, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./apps/api/src/app/app.controller.ts":
/*!********************************************!*\
  !*** ./apps/api/src/app/app.controller.ts ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const tslib_1 = __webpack_require__(/*! tslib */ "tslib");
const node_shared_1 = __webpack_require__(/*! @accel-shooter/node-shared */ "./libs/node-shared/src/index.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const fs_1 = __webpack_require__(/*! fs */ "fs");
const path_1 = __webpack_require__(/*! path */ "path");
const rxjs_1 = __webpack_require__(/*! rxjs */ "rxjs");
const operators_1 = __webpack_require__(/*! rxjs/operators */ "rxjs/operators");
const watch_rx_1 = __webpack_require__(/*! watch-rx */ "watch-rx");
const CONFIG_KEY_MAP = {
    todo: 'TodoFile',
    work_note: 'WorkNoteFile',
};
let AppController = class AppController {
    constructor(configService) {
        this.configService = configService;
    }
    getTasks() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const path = this.configService.get('MySummarizedTasksFile');
            const tasks = JSON.parse(fs_1.readFileSync(path, { encoding: 'utf-8' }));
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
            const content = fs_1.readFileSync(path, { encoding: 'utf-8' });
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
            fs_1.writeFileSync(path, content);
        });
    }
    getChecklist(taskId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const clickUp = new node_shared_1.ClickUp(taskId);
            const task = yield clickUp.getTask();
            const fullTaskName = yield clickUp.getFullTaskName();
            const frameUrls = yield clickUp.getFrameUrls();
            const { gitLabProject, mergeRequestIId } = yield clickUp.getGitLabProjectAndMergeRequestIId();
            const gitLab = new node_shared_1.GitLab(gitLabProject.id);
            const mergeRequest = yield gitLab.getMergeRequest(mergeRequestIId);
            const folderPath = this.configService.get('TaskTodoFolder');
            const path = path_1.join(folderPath, taskId + '.md');
            const content = fs_1.readFileSync(path, { encoding: 'utf-8' });
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
            fs_1.writeFileSync(path_1.join(folderPath, taskId + '.md'), checklist);
            const clickUp = new node_shared_1.ClickUp(taskId);
            const task = yield clickUp.getTask();
            const clickUpChecklist = task.checklists.find((c) => c.name.toLowerCase().includes('synced checklist'));
            if (clickUpChecklist) {
                yield clickUp.updateChecklist(clickUpChecklist, checklist);
            }
        });
    }
    getMRDescription(taskId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const clickUp = new node_shared_1.ClickUp(taskId);
            const { gitLabProject, mergeRequestIId } = yield clickUp.getGitLabProjectAndMergeRequestIId();
            const gitLab = new node_shared_1.GitLab(gitLabProject.id);
            const mergeRequest = yield gitLab.getMergeRequest(mergeRequestIId);
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
            const clickUp = new node_shared_1.ClickUp(taskId);
            const { gitLabProject, mergeRequestIId } = yield clickUp.getGitLabProjectAndMergeRequestIId();
            const gitLab = new node_shared_1.GitLab(gitLabProject.id);
            const mergeRequest = yield gitLab.getMergeRequest(mergeRequestIId);
            return { content: ((_a = mergeRequest.head_pipeline) === null || _a === void 0 ? void 0 : _a.status) || 'none' };
        });
    }
    todoSse() {
        return watch_rx_1.watchRx(node_shared_1.CONFIG.TodoChangeNotificationFile).pipe(operators_1.map(() => fs_1.readFileSync(node_shared_1.CONFIG.TodoFile, { encoding: 'utf-8' })));
    }
};
tslib_1.__decorate([
    common_1.Get('tasks'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", typeof (_a = typeof Promise !== "undefined" && Promise) === "function" ? _a : Object)
], AppController.prototype, "getTasks", null);
tslib_1.__decorate([
    common_1.Get('markdown/:id'),
    tslib_1.__param(0, common_1.Param('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], AppController.prototype, "getMarkdown", null);
tslib_1.__decorate([
    common_1.Put('markdown/:id'),
    tslib_1.__param(0, common_1.Param('id')),
    tslib_1.__param(1, common_1.Body('content')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "putMarkdown", null);
tslib_1.__decorate([
    common_1.Get('task/:id/checklist'),
    tslib_1.__param(0, common_1.Param('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], AppController.prototype, "getChecklist", null);
tslib_1.__decorate([
    common_1.Put('task/:id/checklist'),
    tslib_1.__param(0, common_1.Param('id')),
    tslib_1.__param(1, common_1.Body('checklist')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "putChecklist", null);
tslib_1.__decorate([
    common_1.Get('task/:id/mr_description'),
    tslib_1.__param(0, common_1.Param('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], AppController.prototype, "getMRDescription", null);
tslib_1.__decorate([
    common_1.Put('task/:id/mr_description'),
    tslib_1.__param(0, common_1.Param('id')),
    tslib_1.__param(1, common_1.Body('content')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "putMRDescription", null);
tslib_1.__decorate([
    common_1.Get('task/:id/mr_pipeline_status'),
    tslib_1.__param(0, common_1.Param('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], AppController.prototype, "getMRPipelineStatus", null);
tslib_1.__decorate([
    common_1.Sse('todo-sse'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", typeof (_f = typeof rxjs_1.Observable !== "undefined" && rxjs_1.Observable) === "function" ? _f : Object)
], AppController.prototype, "todoSse", null);
AppController = tslib_1.__decorate([
    common_1.Controller(),
    tslib_1.__metadata("design:paramtypes", [typeof (_g = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _g : Object])
], AppController);
exports.AppController = AppController;


/***/ }),

/***/ "./apps/api/src/app/app.module.ts":
/*!****************************************!*\
  !*** ./apps/api/src/app/app.module.ts ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const tslib_1 = __webpack_require__(/*! tslib */ "tslib");
const node_shared_1 = __webpack_require__(/*! @accel-shooter/node-shared */ "./libs/node-shared/src/index.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const serve_static_1 = __webpack_require__(/*! @nestjs/serve-static */ "@nestjs/serve-static");
const path_1 = __webpack_require__(/*! path */ "path");
const app_controller_1 = __webpack_require__(/*! ./app.controller */ "./apps/api/src/app/app.controller.ts");
const app_service_1 = __webpack_require__(/*! ./app.service */ "./apps/api/src/app/app.service.ts");
let AppModule = class AppModule {
};
AppModule = tslib_1.__decorate([
    common_1.Module({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, load: [node_shared_1.getConfig] }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: path_1.join(__dirname, '..', 'frontend'),
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
/*!*****************************************!*\
  !*** ./apps/api/src/app/app.service.ts ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const tslib_1 = __webpack_require__(/*! tslib */ "tslib");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
let AppService = class AppService {
};
AppService = tslib_1.__decorate([
    common_1.Injectable()
], AppService);
exports.AppService = AppService;


/***/ }),

/***/ "./apps/api/src/main.ts":
/*!******************************!*\
  !*** ./apps/api/src/main.ts ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = __webpack_require__(/*! tslib */ "tslib");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const app_module_1 = __webpack_require__(/*! ./app/app.module */ "./apps/api/src/app/app.module.ts");
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


/***/ }),

/***/ "./libs/node-shared/src/index.ts":
/*!***************************************!*\
  !*** ./libs/node-shared/src/index.ts ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = __webpack_require__(/*! tslib */ "tslib");
tslib_1.__exportStar(__webpack_require__(/*! ./lib/node-shared */ "./libs/node-shared/src/lib/node-shared.ts"), exports);


/***/ }),

/***/ "./libs/node-shared/src/lib/classes/clickup.class.ts":
/*!***********************************************************!*\
  !*** ./libs/node-shared/src/lib/classes/clickup.class.ts ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickUp = void 0;
const tslib_1 = __webpack_require__(/*! tslib */ "tslib");
const cli_progress_1 = __webpack_require__(/*! cli-progress */ "cli-progress");
const fs_1 = __webpack_require__(/*! fs */ "fs");
const path_1 = __webpack_require__(/*! path */ "path");
const config_1 = __webpack_require__(/*! ../config */ "./libs/node-shared/src/lib/config.ts");
const api_utils_1 = __webpack_require__(/*! ../utils/api.utils */ "./libs/node-shared/src/lib/utils/api.utils.ts");
const case_utils_1 = __webpack_require__(/*! ../utils/case.utils */ "./libs/node-shared/src/lib/utils/case.utils.ts");
const checklist_utils_1 = __webpack_require__(/*! ../utils/checklist.utils */ "./libs/node-shared/src/lib/utils/checklist.utils.ts");
const callApi = api_utils_1.callApiFactory('ClickUp');
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
    static getRTVTasks(teamId, userID) {
        return callApi('get', `/team/${teamId}/task/`, {
            statuses: ['ready to verify'],
            include_closed: true,
            assignees: [userID],
        });
    }
    static getMyTasks(teamId, userID) {
        return callApi('get', `/team/${teamId}/task/`, {
            statuses: [
                'Open',
                'pending',
                'ready to do',
                'in progress',
                'in discussion',
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
    getFrameUrls() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let currentTaskId = this.taskId;
            let rootTaskId = null;
            const frameUrls = [];
            while (currentTaskId) {
                const clickUp = new ClickUp(currentTaskId);
                const task = yield clickUp.getTask();
                if (!task.parent) {
                    rootTaskId = task.id;
                }
                currentTaskId = task.parent;
            }
            const taskQueue = [rootTaskId];
            while (taskQueue.length > 0) {
                const taskId = taskQueue.shift();
                const clickUp = new ClickUp(taskId);
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
                });
            }
            return frameUrls;
        });
    }
    getGitLabProjectAndMergeRequestIId() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const task = yield this.getTask();
            const clickUpChecklist = task.checklists.find((c) => c.name.toLowerCase().includes('synced checklist'));
            if (clickUpChecklist) {
                const match = clickUpChecklist.name.match(/\[(.*?) !([\d]+)\]/);
                if (match) {
                    return {
                        gitLabProject: config_1.CONFIG.GitLabProjects.find((p) => p.repo.toLowerCase() === match[1].toLowerCase()),
                        mergeRequestIId: match[2],
                    };
                }
            }
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
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const task = yield this.getTask();
            const name = yield this.getFullTaskName(task);
            const progress = this.getTaskProgress();
            const spaceName = (yield ClickUp.getSpace(task.space.id)).name;
            const link = `[${spaceName}: ${name}](${task.url})`;
            switch (mode) {
                case 'todo':
                    return `- [ ] ${link}`;
                case 'dp':
                    return task.status.status === 'in progress' && progress
                        ? `* (${case_utils_1.titleCase(task.status.status)} ${progress}) ${link}`
                        : `* (${case_utils_1.titleCase(task.status.status)}) ${link}`;
            }
        });
    }
    getTaskProgress() {
        const path = path_1.join(config_1.CONFIG.TaskTodoFolder, this.taskId + '.md');
        if (fs_1.existsSync(path)) {
            const content = fs_1.readFileSync(path, { encoding: 'utf-8' });
            const checklist = checklist_utils_1.normalizeMarkdownChecklist(content);
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
                    space: (yield ClickUp.getSpace(task.space.id)).name,
                });
                bar.increment(1);
            }
            return summarizedTasks;
        });
    }
    updateChecklist(clickUpChecklist, markdownChecklistString) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const markdownNormalizedChecklist = checklist_utils_1.normalizeMarkdownChecklist(markdownChecklistString, true);
            const clickUpNormalizedChecklist = checklist_utils_1.normalizeClickUpChecklist(clickUpChecklist.items);
            const actions = checklist_utils_1.getSyncChecklistActions(clickUpNormalizedChecklist, markdownNormalizedChecklist);
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
}
exports.ClickUp = ClickUp;


/***/ }),

/***/ "./libs/node-shared/src/lib/classes/gitlab.class.ts":
/*!**********************************************************!*\
  !*** ./libs/node-shared/src/lib/classes/gitlab.class.ts ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.GitLab = void 0;
const tslib_1 = __webpack_require__(/*! tslib */ "tslib");
const config_1 = __webpack_require__(/*! ../config */ "./libs/node-shared/src/lib/config.ts");
const api_utils_1 = __webpack_require__(/*! ../utils/api.utils */ "./libs/node-shared/src/lib/utils/api.utils.ts");
const callApi = api_utils_1.callApiFactory('GitLab');
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
    getMergeRequest(mergeRequestNumber) {
        return callApi('get', `/projects/${this.projectId}/merge_requests/${mergeRequestNumber}`);
    }
    getMergeRequestChanges(mergeRequestNumber) {
        return callApi('get', `/projects/${this.projectId}/merge_requests/${mergeRequestNumber}/changes`);
    }
    getCommit(sha) {
        return callApi('get', `/projects/${this.projectId}/repository/commits/${sha}`);
    }
    getEndingAssignee() {
        if (!config_1.CONFIG.EndingAssignee) {
            throw Error('No ending assignee was set');
        }
        return callApi('get', `/users`, {
            username: config_1.CONFIG.EndingAssignee,
        }).then((users) => users[0]);
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
    createBranch(branch) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return callApi('post', `/projects/${this.projectId}/repository/branches`, null, {
                branch,
                ref: yield this.getDefaultBranchName(),
            });
        });
    }
    createMergeRequest(title, branch, description) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return callApi('post', `/projects/${this.projectId}/merge_requests`, null, {
                source_branch: branch,
                target_branch: yield this.getDefaultBranchName(),
                title: `Draft: ${title}`,
                description,
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
            const assignee = yield this.getEndingAssignee();
            yield callApi('put', `/projects/${this.projectId}/merge_requests/${merge_request.iid}`, null, {
                title: merge_request.title.replace('WIP: ', '').replace('Draft: ', ''),
                assignee_id: assignee.id,
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
                before,
                after,
                sort: 'asc',
                per_page: 100,
            });
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

/***/ "./libs/node-shared/src/lib/config.ts":
/*!********************************************!*\
  !*** ./libs/node-shared/src/lib/config.ts ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG = exports.getConfig = exports.getConfigPath = void 0;
const tslib_1 = __webpack_require__(/*! tslib */ "tslib");
const fs_1 = __webpack_require__(/*! fs */ "fs");
const untildify_1 = tslib_1.__importDefault(__webpack_require__(/*! untildify */ "untildify"));
function getConfigPath() {
    if (process.env.ACCEL_SHOOTER_CONFIG_FILE) {
        return untildify_1.default(process.env.ACCEL_SHOOTER_CONFIG_FILE);
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
    const config = JSON.parse(fs_1.readFileSync(configPath, { encoding: 'utf-8' }));
    config.GitLabProjects = config.GitLabProjects.map((p) => (Object.assign(Object.assign({}, p), { path: untildify_1.default(p.path) })));
    const filePathKeys = [
        'TaskTodoFolder',
        'TodoFile',
        'TodoChangeNotificationFile',
        'WorkNoteFile',
        'MySummarizedTasksFile',
        'HolidayFile',
    ];
    filePathKeys.forEach((key) => {
        config[key] = untildify_1.default(config[key]);
    });
    return config;
}
exports.getConfig = getConfig;
exports.CONFIG = getConfig();


/***/ }),

/***/ "./libs/node-shared/src/lib/models/clickup/checklist.models.ts":
/*!*********************************************************************!*\
  !*** ./libs/node-shared/src/lib/models/clickup/checklist.models.ts ***!
  \*********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./libs/node-shared/src/lib/models/clickup/space.models.ts":
/*!*****************************************************************!*\
  !*** ./libs/node-shared/src/lib/models/clickup/space.models.ts ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./libs/node-shared/src/lib/models/clickup/task.models.ts":
/*!****************************************************************!*\
  !*** ./libs/node-shared/src/lib/models/clickup/task.models.ts ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./libs/node-shared/src/lib/models/gitlab/job.models.ts":
/*!**************************************************************!*\
  !*** ./libs/node-shared/src/lib/models/gitlab/job.models.ts ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./libs/node-shared/src/lib/models/gitlab/merge-request.models.ts":
/*!************************************************************************!*\
  !*** ./libs/node-shared/src/lib/models/gitlab/merge-request.models.ts ***!
  \************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./libs/node-shared/src/lib/models/models.ts":
/*!***************************************************!*\
  !*** ./libs/node-shared/src/lib/models/models.ts ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./libs/node-shared/src/lib/node-shared.ts":
/*!*************************************************!*\
  !*** ./libs/node-shared/src/lib/node-shared.ts ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = exports.getTaskIdFromBranchName = exports.normalizeMarkdownChecklist = exports.normalizeClickUpChecklist = exports.getSyncChecklistActions = exports.titleCase = exports.ProjectCheckItem = exports.NormalizedChecklist = exports.IHoliday = exports.GitLabProject = exports.FullMergeRequest = exports.Change = exports.Job = exports.Task = exports.Space = exports.ChecklistItem = exports.getConfig = exports.CONFIG = exports.GitLab = exports.ClickUp = void 0;
var clickup_class_1 = __webpack_require__(/*! ./classes/clickup.class */ "./libs/node-shared/src/lib/classes/clickup.class.ts");
Object.defineProperty(exports, "ClickUp", { enumerable: true, get: function () { return clickup_class_1.ClickUp; } });
var gitlab_class_1 = __webpack_require__(/*! ./classes/gitlab.class */ "./libs/node-shared/src/lib/classes/gitlab.class.ts");
Object.defineProperty(exports, "GitLab", { enumerable: true, get: function () { return gitlab_class_1.GitLab; } });
var config_1 = __webpack_require__(/*! ./config */ "./libs/node-shared/src/lib/config.ts");
Object.defineProperty(exports, "CONFIG", { enumerable: true, get: function () { return config_1.CONFIG; } });
Object.defineProperty(exports, "getConfig", { enumerable: true, get: function () { return config_1.getConfig; } });
var checklist_models_1 = __webpack_require__(/*! ./models/clickup/checklist.models */ "./libs/node-shared/src/lib/models/clickup/checklist.models.ts");
Object.defineProperty(exports, "ChecklistItem", { enumerable: true, get: function () { return checklist_models_1.ChecklistItem; } });
var space_models_1 = __webpack_require__(/*! ./models/clickup/space.models */ "./libs/node-shared/src/lib/models/clickup/space.models.ts");
Object.defineProperty(exports, "Space", { enumerable: true, get: function () { return space_models_1.Space; } });
var task_models_1 = __webpack_require__(/*! ./models/clickup/task.models */ "./libs/node-shared/src/lib/models/clickup/task.models.ts");
Object.defineProperty(exports, "Task", { enumerable: true, get: function () { return task_models_1.Task; } });
var job_models_1 = __webpack_require__(/*! ./models/gitlab/job.models */ "./libs/node-shared/src/lib/models/gitlab/job.models.ts");
Object.defineProperty(exports, "Job", { enumerable: true, get: function () { return job_models_1.Job; } });
var merge_request_models_1 = __webpack_require__(/*! ./models/gitlab/merge-request.models */ "./libs/node-shared/src/lib/models/gitlab/merge-request.models.ts");
Object.defineProperty(exports, "Change", { enumerable: true, get: function () { return merge_request_models_1.Change; } });
Object.defineProperty(exports, "FullMergeRequest", { enumerable: true, get: function () { return merge_request_models_1.FullMergeRequest; } });
var models_1 = __webpack_require__(/*! ./models/models */ "./libs/node-shared/src/lib/models/models.ts");
Object.defineProperty(exports, "GitLabProject", { enumerable: true, get: function () { return models_1.GitLabProject; } });
Object.defineProperty(exports, "IHoliday", { enumerable: true, get: function () { return models_1.IHoliday; } });
Object.defineProperty(exports, "NormalizedChecklist", { enumerable: true, get: function () { return models_1.NormalizedChecklist; } });
Object.defineProperty(exports, "ProjectCheckItem", { enumerable: true, get: function () { return models_1.ProjectCheckItem; } });
var case_utils_1 = __webpack_require__(/*! ./utils/case.utils */ "./libs/node-shared/src/lib/utils/case.utils.ts");
Object.defineProperty(exports, "titleCase", { enumerable: true, get: function () { return case_utils_1.titleCase; } });
var checklist_utils_1 = __webpack_require__(/*! ./utils/checklist.utils */ "./libs/node-shared/src/lib/utils/checklist.utils.ts");
Object.defineProperty(exports, "getSyncChecklistActions", { enumerable: true, get: function () { return checklist_utils_1.getSyncChecklistActions; } });
Object.defineProperty(exports, "normalizeClickUpChecklist", { enumerable: true, get: function () { return checklist_utils_1.normalizeClickUpChecklist; } });
Object.defineProperty(exports, "normalizeMarkdownChecklist", { enumerable: true, get: function () { return checklist_utils_1.normalizeMarkdownChecklist; } });
var clickup_utils_1 = __webpack_require__(/*! ./utils/clickup.utils */ "./libs/node-shared/src/lib/utils/clickup.utils.ts");
Object.defineProperty(exports, "getTaskIdFromBranchName", { enumerable: true, get: function () { return clickup_utils_1.getTaskIdFromBranchName; } });
var sleep_utils_1 = __webpack_require__(/*! ./utils/sleep.utils */ "./libs/node-shared/src/lib/utils/sleep.utils.ts");
Object.defineProperty(exports, "sleep", { enumerable: true, get: function () { return sleep_utils_1.sleep; } });


/***/ }),

/***/ "./libs/node-shared/src/lib/utils/api.utils.ts":
/*!*****************************************************!*\
  !*** ./libs/node-shared/src/lib/utils/api.utils.ts ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.callApiFactory = void 0;
const tslib_1 = __webpack_require__(/*! tslib */ "tslib");
const node_fetch_1 = tslib_1.__importDefault(__webpack_require__(/*! node-fetch */ "node-fetch"));
const qs_1 = tslib_1.__importDefault(__webpack_require__(/*! qs */ "qs"));
const config_1 = __webpack_require__(/*! ../config */ "./libs/node-shared/src/lib/config.ts");
const sleep_utils_1 = __webpack_require__(/*! ./sleep.utils */ "./libs/node-shared/src/lib/utils/sleep.utils.ts");
const RETRY_SETTING = {
    retry: 5,
    pause: 12 * 1000,
};
function fetchRetry(url, opts) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let retry = (opts && opts.retry) || 3;
        while (retry > 0) {
            try {
                return yield node_fetch_1.default(url, opts).then(checkStatus);
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
                    yield sleep_utils_1.sleep(opts.pause);
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
/*!******************************************************!*\
  !*** ./libs/node-shared/src/lib/utils/case.utils.ts ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
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
/*!***********************************************************!*\
  !*** ./libs/node-shared/src/lib/utils/checklist.utils.ts ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
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
/*!*********************************************************!*\
  !*** ./libs/node-shared/src/lib/utils/clickup.utils.ts ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.getTaskIdFromBranchName = void 0;
function getTaskIdFromBranchName(branchName) {
    const result = branchName.match(/CU-([a-z0-9]+)/);
    return result ? result[1] : null;
}
exports.getTaskIdFromBranchName = getTaskIdFromBranchName;


/***/ }),

/***/ "./libs/node-shared/src/lib/utils/sleep.utils.ts":
/*!*******************************************************!*\
  !*** ./libs/node-shared/src/lib/utils/sleep.utils.ts ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = void 0;
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
exports.sleep = sleep;


/***/ }),

/***/ 0:
/*!************************************!*\
  !*** multi ./apps/api/src/main.ts ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! /Users/nanoha/git/accel-shooter/apps/api/src/main.ts */"./apps/api/src/main.ts");


/***/ }),

/***/ "@nestjs/common":
/*!*********************************!*\
  !*** external "@nestjs/common" ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@nestjs/common");

/***/ }),

/***/ "@nestjs/config":
/*!*********************************!*\
  !*** external "@nestjs/config" ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@nestjs/config");

/***/ }),

/***/ "@nestjs/core":
/*!*******************************!*\
  !*** external "@nestjs/core" ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@nestjs/core");

/***/ }),

/***/ "@nestjs/serve-static":
/*!***************************************!*\
  !*** external "@nestjs/serve-static" ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@nestjs/serve-static");

/***/ }),

/***/ "cli-progress":
/*!*******************************!*\
  !*** external "cli-progress" ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("cli-progress");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),

/***/ "node-fetch":
/*!*****************************!*\
  !*** external "node-fetch" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("node-fetch");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),

/***/ "qs":
/*!*********************!*\
  !*** external "qs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("qs");

/***/ }),

/***/ "rxjs":
/*!***********************!*\
  !*** external "rxjs" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("rxjs");

/***/ }),

/***/ "rxjs/operators":
/*!*********************************!*\
  !*** external "rxjs/operators" ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("rxjs/operators");

/***/ }),

/***/ "tslib":
/*!************************!*\
  !*** external "tslib" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("tslib");

/***/ }),

/***/ "untildify":
/*!****************************!*\
  !*** external "untildify" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("untildify");

/***/ }),

/***/ "watch-rx":
/*!***************************!*\
  !*** external "watch-rx" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("watch-rx");

/***/ })

/******/ })));
//# sourceMappingURL=main.js.map