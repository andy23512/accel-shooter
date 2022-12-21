/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./apps/cli/src/actions.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.configReadline = void 0;
const tslib_1 = __webpack_require__("tslib");
const readline_1 = tslib_1.__importDefault(__webpack_require__("readline"));
function configReadline() {
    readline_1.default.emitKeypressEvents(process.stdin);
}
exports.configReadline = configReadline;


/***/ }),

/***/ "./apps/cli/src/actions/bi-weekly-progress.action.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.biWeeklyProgressAction = void 0;
const tslib_1 = __webpack_require__("tslib");
const node_shared_1 = __webpack_require__("./libs/node-shared/src/index.ts");
const clipboardy_1 = tslib_1.__importDefault(__webpack_require__("clipboardy"));
const date_fns_1 = __webpack_require__("date-fns");
const ramda_1 = __webpack_require__("ramda");
const daily_progress_class_1 = __webpack_require__("./apps/cli/src/classes/daily-progress.class.ts");
const holiday_class_1 = __webpack_require__("./apps/cli/src/classes/holiday.class.ts");
const utils_1 = __webpack_require__("./apps/cli/src/utils.ts");
function biWeeklyProgressAction() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const today = new Date();
        const startDay = (0, utils_1.getDayFromArgv)((0, date_fns_1.add)(today, { weeks: -2 }));
        let fetchDay = new Date(today.valueOf());
        const holiday = new holiday_class_1.Holiday();
        const fetchDays = [];
        while ((0, date_fns_1.compareAsc)(startDay, fetchDay) != 0) {
            if (holiday.checkIsWorkday(fetchDay)) {
                fetchDays.push(fetchDay);
            }
            fetchDay = (0, date_fns_1.add)(fetchDay, { days: -1 });
        }
        const dpContent = new daily_progress_class_1.DailyProgress().readFile();
        const data = {};
        for (const d of fetchDays) {
            const previousWorkDayString = (0, node_shared_1.formatDate)(holiday.getPreviousWorkday(d));
            const dString = (0, node_shared_1.formatDate)(d);
            const matchResult = dpContent.match(new RegExp(`### ${dString}\n1\. Previous Day\n(.*?)\n2\. Today`, 's'));
            if (matchResult) {
                const record = matchResult[1];
                const lines = record.split('\n').filter(Boolean);
                for (const line of lines) {
                    const matchItem = line.match(/(\([A-Za-z0-9 %]+\)) \[(.*?)\]\((https:\/\/app.clickup.com\/t\/(\w+))\)/);
                    if (matchItem) {
                        const name = matchItem[2];
                        const url = matchItem[3];
                        const taskId = matchItem[4];
                        if (data[url]) {
                            data[url].days.push(previousWorkDayString);
                        }
                        else {
                            const { gitLabProject } = yield new node_shared_1.ClickUp(taskId).getGitLabProjectAndMergeRequestIId();
                            data[url] = {
                                url,
                                name,
                                project: gitLabProject.name,
                                days: [previousWorkDayString],
                            };
                        }
                    }
                }
            }
            else {
                console.log('No Result!');
            }
        }
        const finalData = Object.values(data).map((item) => (Object.assign(Object.assign({}, item), { startDay: item.days[item.days.length - 1], endDay: item.days[0] })));
        finalData.sort((a, b) => a.endDay.localeCompare(b.endDay));
        const groupedRecords = (0, ramda_1.groupBy)((0, ramda_1.prop)('project'), finalData);
        const previousWorkDayOfToday = holiday.getPreviousWorkday(today);
        let result = `## ${(0, node_shared_1.formatDate)(startDay)}~${(0, node_shared_1.formatDate)(previousWorkDayOfToday)}`;
        Object.entries(groupedRecords).forEach(([project, records]) => {
            result += `\n- ${project}`;
            records.forEach(({ name, url, startDay, endDay }) => {
                if (startDay === endDay) {
                    result += `\n  - ${startDay} [${name}](${url})`;
                }
                else {
                    result += `\n  - ${startDay}~${subtractCommon(endDay, startDay)} [${name}](${url})`;
                }
            });
        });
        clipboardy_1.default.writeSync(result);
        console.log('Copied!');
    });
}
exports.biWeeklyProgressAction = biWeeklyProgressAction;
function subtractCommon(a, b) {
    const ar = a.split('/');
    const br = b.split('/');
    let i = 0;
    while (i < ar.length && ar[i] === br[i]) {
        i++;
    }
    return ar.slice(i).join('/');
}


/***/ }),

/***/ "./apps/cli/src/actions/check.action.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.checkAction = void 0;
const tslib_1 = __webpack_require__("tslib");
const checker_class_1 = __webpack_require__("./apps/cli/src/classes/checker.class.ts");
const utils_1 = __webpack_require__("./apps/cli/src/utils.ts");
function checkAction() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const selectMode = process.argv.includes("-s") || process.argv.includes("--select");
        process.argv = process.argv.filter((a) => a !== "-s" && a !== "--select");
        const { gitLabProject, mergeRequestIId } = yield (0, utils_1.getInfoFromArgv)();
        const checker = new checker_class_1.Checker(gitLabProject, mergeRequestIId, selectMode);
        yield checker.start();
    });
}
exports.checkAction = checkAction;


/***/ }),

/***/ "./apps/cli/src/actions/close.action.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.closeAction = void 0;
const tslib_1 = __webpack_require__("tslib");
const progress_log_class_1 = __webpack_require__("./apps/cli/src/classes/progress-log.class.ts");
const todo_class_1 = __webpack_require__("./apps/cli/src/classes/todo.class.ts");
const utils_1 = __webpack_require__("./apps/cli/src/utils.ts");
function closeAction() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { gitLab, mergeRequest, clickUp, clickUpTaskId } = yield (0, utils_1.getInfoFromArgv)();
        const p = new progress_log_class_1.CustomProgressLog('Close', [
            'Close GitLab Merge Request',
            'Update ClickUp Task Status',
            'Close Tab Group',
            'Remove Todo',
        ]);
        p.next(); // Close GitLab Merge Request
        yield gitLab.closeMergeRequest(mergeRequest);
        p.next(); // Update ClickUp Task Status
        yield clickUp.setTaskStatus('suspended');
        p.next(); // Close Tab Group
        (0, utils_1.openUrlsInTabGroup)([], clickUpTaskId);
        p.next(); // Remove Todo
        const todo = new todo_class_1.Todo();
        todo.removeTodo(clickUpTaskId);
        p.end(0);
    });
}
exports.closeAction = closeAction;


/***/ }),

/***/ "./apps/cli/src/actions/commit.action.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.commitAction = void 0;
const tslib_1 = __webpack_require__("tslib");
const fuzzy_1 = tslib_1.__importDefault(__webpack_require__("fuzzy"));
const inquirer_1 = tslib_1.__importDefault(__webpack_require__("inquirer"));
const inquirer_autocomplete_prompt_1 = tslib_1.__importDefault(__webpack_require__("inquirer-autocomplete-prompt"));
const commit_scope_class_1 = __webpack_require__("./apps/cli/src/classes/commit-scope.class.ts");
const utils_1 = __webpack_require__("./apps/cli/src/utils.ts");
const TYPES = [
    'feat',
    'fix',
    'docs',
    'style',
    'refactor',
    'perf',
    'test',
    'build',
    'ci',
    'chore',
    'revert',
];
function commitAction() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { mergeRequest } = yield (0, utils_1.getInfoFromArgv)(false, true);
        if (mergeRequest) {
            const title = mergeRequest.title;
            if (!(title.startsWith('WIP: ') || title.startsWith('Draft: '))) {
                console.log('Merge request is ready. Cannot commit.');
                return;
            }
        }
        const dryRunResult = yield (0, utils_1.promiseSpawn)('git', ['commit', '--dry-run'], 'pipe');
        if (dryRunResult.stdout.includes('nothing to commit, working tree clean')) {
            console.log('Nothing to commit.');
            return;
        }
        const repoName = (0, utils_1.getRepoName)();
        inquirer_1.default.registerPrompt('autocomplete', inquirer_autocomplete_prompt_1.default);
        const commitScope = new commit_scope_class_1.CommitScope();
        const commitScopeItems = commitScope.getItems(repoName);
        const answers = yield inquirer_1.default.prompt([
            {
                name: 'type',
                message: 'Enter commit type',
                type: 'autocomplete',
                source: (_, input = '') => {
                    return Promise.resolve(fuzzy_1.default.filter(input, TYPES).map((t) => t.original));
                },
            },
            {
                name: 'scope',
                message: 'Enter commit scope',
                type: 'autocomplete',
                source: (_, input = '') => {
                    return Promise.resolve(fuzzy_1.default.filter(input, commitScopeItems).map((t) => t.original));
                },
            },
            {
                name: 'subject',
                message: 'Enter commit subject',
                type: 'input',
            },
        ]);
        const { type, scope, subject } = answers;
        const finalScope = scope === 'empty' ? null : scope;
        const message = `${type}${finalScope ? '(' + finalScope + ')' : ''}: ${subject}`;
        yield (0, utils_1.promiseSpawn)('git', ['commit', '-m', `"${message}"`], 'inherit');
    });
}
exports.commitAction = commitAction;


/***/ }),

/***/ "./apps/cli/src/actions/copy.action.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.copyAction = void 0;
const tslib_1 = __webpack_require__("tslib");
const clipboardy_1 = tslib_1.__importDefault(__webpack_require__("clipboardy"));
const utils_1 = __webpack_require__("./apps/cli/src/utils.ts");
function copyAction() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { clickUp } = yield (0, utils_1.getInfoFromArgv)(true);
        const string = yield clickUp.getTaskString('todo');
        clipboardy_1.default.writeSync(string);
        console.log('Copied!');
    });
}
exports.copyAction = copyAction;


/***/ }),

/***/ "./apps/cli/src/actions/daily-progress.action.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.dailyProgressAction = void 0;
const tslib_1 = __webpack_require__("tslib");
const child_process_1 = __webpack_require__("child_process");
const date_fns_1 = __webpack_require__("date-fns");
const node_shared_1 = __webpack_require__("./libs/node-shared/src/index.ts");
const daily_progress_class_1 = __webpack_require__("./apps/cli/src/classes/daily-progress.class.ts");
const holiday_class_1 = __webpack_require__("./apps/cli/src/classes/holiday.class.ts");
const progress_log_class_1 = __webpack_require__("./apps/cli/src/classes/progress-log.class.ts");
const todo_class_1 = __webpack_require__("./apps/cli/src/classes/todo.class.ts");
const utils_1 = __webpack_require__("./apps/cli/src/utils.ts");
function dailyProgressAction() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const p = new progress_log_class_1.CustomProgressLog('Daily Progress', [
            'Get Date',
            'Get Pushed Events',
            'Get Progressed Tasks',
            'Get Todo Task',
            'Get Processing Tasks',
            'Get Reviewed Merge Requests',
            'Get Meetings',
            'Add Day Progress Entry',
            'Copy Day Progress into Clipboard',
        ]);
        p.start(); // Get Date
        const day = (0, utils_1.getDayFromArgv)();
        const holiday = new holiday_class_1.Holiday();
        const previousWorkDay = holiday.getPreviousWorkday(day);
        console.log('Previous work day:', (0, node_shared_1.formatDate)(previousWorkDay));
        p.next(); // Get Pushed Events
        const after = (0, date_fns_1.add)(previousWorkDay, { days: -1 });
        const before = day;
        const pushedToEvents = (yield node_shared_1.GitLab.getPushedEvents(after, before)).filter((e) => e.action_name === 'pushed to');
        const modifiedBranches = [
            ...new Set(pushedToEvents.map((e) => e.push_data.ref)),
        ];
        p.next(); // Get Progressed Tasks
        let previousDayItems = [];
        for (const b of modifiedBranches) {
            const taskId = (0, node_shared_1.getTaskIdFromBranchName)(b);
            if (taskId) {
                previousDayItems.push('    ' + (yield new node_shared_1.ClickUp(taskId).getTaskString('dp')));
            }
        }
        p.next(); // Get Todo Task
        let todayItems = [];
        const todo = new todo_class_1.Todo();
        const todoContent = todo.readFile();
        let matchResult = todoContent.match(/## Todo\n([\s\S]+)\n##/);
        if (matchResult) {
            const todoList = matchResult[1].split('\n');
            const firstTodo = todoList[0];
            matchResult = firstTodo.match(/https:\/\/app.clickup.com\/t\/(\w+)\)/);
            if (matchResult) {
                const taskId = matchResult[1];
                const clickUp = new node_shared_1.ClickUp(taskId);
                const taskString = yield clickUp.getTaskString('dp');
                todayItems.push('    ' + taskString);
            }
            else {
                todayItems.push('    ' + firstTodo.replace('- [ ]', '*'));
            }
        }
        else {
            throw Error('Todo File Broken');
        }
        p.next(); // Get Processing Tasks
        matchResult = todoContent.match(/## Processing\n([\s\S]+)\n##/);
        if (matchResult) {
            const processingList = matchResult[1].split('\n');
            const firstProcessingItem = processingList[0];
            matchResult = firstProcessingItem.match(/https:\/\/app.clickup.com\/t\/(\w+)\)/);
            if (matchResult) {
                const taskId = matchResult[1];
                const clickUp = new node_shared_1.ClickUp(taskId);
                const taskString = yield clickUp.getTaskString('dp');
                previousDayItems.push('    ' + taskString);
                todayItems.push('    ' + (yield clickUp.getTaskString('dp')));
            }
            else if (firstProcessingItem.includes('- [ ]')) {
                previousDayItems.push('    ' + firstProcessingItem.replace('- [ ]', '*'));
                todayItems.push('    ' + firstProcessingItem.replace('- [ ]', '*'));
            }
        }
        if (todayItems.length === 0) {
            console.log('Todo of today is empty!');
            process.exit();
        }
        previousDayItems = [...new Set(previousDayItems)];
        todayItems = [...new Set(todayItems)];
        p.next(); // Get Reviewed Merge Requests
        const approvedEvents = yield node_shared_1.GitLab.getApprovedEvents(after, before);
        if (approvedEvents.length > 0) {
            previousDayItems.push('    * Review');
            for (const approvedEvent of approvedEvents) {
                const projectId = approvedEvent.project_id;
                const mergeRequestIId = approvedEvent.target_iid;
                const gitLab = new node_shared_1.GitLab(projectId.toString());
                const mergeRequest = yield gitLab.getMergeRequest(mergeRequestIId);
                previousDayItems.push(`        * [${mergeRequest.title}](${mergeRequest.web_url})`);
            }
        }
        p.next(); // Get Meetings
        const g = new node_shared_1.Google();
        const previousDayMeeting = yield g.listAttendingEvent(previousWorkDay.toISOString(), day.toISOString());
        const todayMeeting = yield g.listAttendingEvent(day.toISOString(), (0, date_fns_1.add)(day, { days: 1 }).toISOString());
        if (previousDayMeeting.length > 0) {
            previousDayItems.push('    * Meeting');
            for (const m of previousDayMeeting) {
                previousDayItems.push(`        * ${m.summary}`);
            }
        }
        if (todayMeeting.length > 0) {
            todayItems.push('    * Meeting');
            for (const m of todayMeeting) {
                todayItems.push(`        * ${m.summary}`);
            }
        }
        p.next(); // Add Day Progress Entry
        const dayDp = `### ${(0, node_shared_1.formatDate)(day)}\n1. Previous Day\n${previousDayItems.join('\n')}\n2. Today\n${todayItems.join('\n')}\n3. No blockers so far`;
        new daily_progress_class_1.DailyProgress().addDayProgress(dayDp);
        p.next(); // Copy Day Progress into Clipboard
        let resultRecord = dayDp;
        resultRecord = resultRecord
            .replace(/\* (\([A-Za-z0-9 %]+\)) \[(.*?)\]\((https:\/\/app.clickup.com\/t\/\w+)\).*/g, '* $1 <a href="$3">$2</a>')
            .replace(/\* \[(.*?)\]\((https:\/\/gitlab\.com.*?)\)/g, '* <a href="$2">$1</a>')
            .replace(/ {2}-/g, '&nbsp;&nbsp;-')
            .replace(/ {8}\*/g, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*')
            .replace(/ {4}\*/g, '&nbsp;&nbsp;&nbsp;&nbsp;*')
            .replace(/\n/g, '<br/>')
            .replace(/'/g, '');
        (0, child_process_1.execSync)(`
  echo '${resultRecord}' |\
  hexdump -ve '1/1 "%.2x"' |\
  xargs printf "set the clipboard to {text:\\\" \\\", «class HTML»:«data HTML%s»}" |\
  osascript -
  `);
        p.end(0);
    });
}
exports.dailyProgressAction = dailyProgressAction;


/***/ }),

/***/ "./apps/cli/src/actions/dump-my-tasks.action.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.dumpMyTasksAction = void 0;
const tslib_1 = __webpack_require__("tslib");
const node_shared_1 = __webpack_require__("./libs/node-shared/src/index.ts");
const fs_1 = __webpack_require__("fs");
function dumpMyTasksAction() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const mySummarizedTasks = yield node_shared_1.ClickUp.getMySummarizedTasks();
        (0, fs_1.writeFileSync)(node_shared_1.CONFIG.MySummarizedTasksFile, JSON.stringify(mySummarizedTasks));
    });
}
exports.dumpMyTasksAction = dumpMyTasksAction;


/***/ }),

/***/ "./apps/cli/src/actions/end.action.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.endAction = void 0;
const tslib_1 = __webpack_require__("tslib");
const node_shared_1 = __webpack_require__("./libs/node-shared/src/index.ts");
const progress_log_class_1 = __webpack_require__("./apps/cli/src/classes/progress-log.class.ts");
const todo_class_1 = __webpack_require__("./apps/cli/src/classes/todo.class.ts");
const utils_1 = __webpack_require__("./apps/cli/src/utils.ts");
function endAction() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { gitLab, mergeRequest, clickUp, clickUpTask, clickUpTaskId } = yield (0, utils_1.getInfoFromArgv)();
        const p = new progress_log_class_1.CustomProgressLog('End', [
            'Check Task is Completed or not',
            'Update GitLab Merge Request Ready Status and Assignee',
            'Update ClickUp Task Status',
            'Close Tab Group',
            'Remove Todo',
        ]);
        p.next(); // Check Task is Completed or not
        const targetChecklist = clickUpTask.checklists.find((c) => c.name.toLowerCase().includes('synced checklist'));
        const clickUpNormalizedChecklist = (0, node_shared_1.normalizeClickUpChecklist)(targetChecklist.items);
        const fullCompleted = clickUpNormalizedChecklist.every((item) => item.checked);
        if (!fullCompleted) {
            console.log('This task has uncompleted todo(s).');
            process.exit();
        }
        p.next(); // Update GitLab Merge Request Ready Status and Assignee
        yield gitLab.markMergeRequestAsReadyAndAddAssignee(mergeRequest);
        p.next(); // Update ClickUp Task Status
        try {
            yield clickUp.setTaskStatus('in review');
        }
        catch (_a) {
            yield clickUp.setTaskStatus('review');
        }
        p.next(); // Close Tab Group
        (0, utils_1.openUrlsInTabGroup)([], clickUpTaskId);
        p.next(); // Remove Todo
        const todo = new todo_class_1.Todo();
        todo.removeTodo(clickUpTaskId);
        p.end(0);
        console.log('Merge Request URL: ' + mergeRequest.web_url);
    });
}
exports.endAction = endAction;


/***/ }),

/***/ "./apps/cli/src/actions/fetch-holiday.action.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fetchHolidayAction = void 0;
const tslib_1 = __webpack_require__("tslib");
const node_fetch_1 = tslib_1.__importDefault(__webpack_require__("node-fetch"));
const holiday_class_1 = __webpack_require__("./apps/cli/src/classes/holiday.class.ts");
function fetchHolidayAction() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let page = 0;
        let holidays = [];
        let data = null;
        while (data === null || data.length !== 0) {
            const response = yield (0, node_fetch_1.default)(`https://data.ntpc.gov.tw/api/datasets/308DCD75-6434-45BC-A95F-584DA4FED251/json?page=${page}&size=1000`);
            data = yield response.json();
            holidays = [...holidays, ...data];
            page += 1;
        }
        new holiday_class_1.Holiday().writeFile(JSON.stringify(holidays, null, 2));
    });
}
exports.fetchHolidayAction = fetchHolidayAction;


/***/ }),

/***/ "./apps/cli/src/actions/list-dc.action.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.listDCAction = void 0;
const tslib_1 = __webpack_require__("tslib");
const child_process_1 = __webpack_require__("child_process");
function listDCAction() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const result = (0, child_process_1.execSync)(`for c in \`docker ps -q\`; do docker inspect $c --format '{{ index .Config.Labels "com.docker.compose.project.working_dir"}} ' ; done`, { encoding: 'utf-8' });
        const workDirs = [
            ...new Set(result
                .trim()
                .split('\n')
                .map((s) => s.trim())),
        ];
        console.log(workDirs);
    });
}
exports.listDCAction = listDCAction;


/***/ }),

/***/ "./apps/cli/src/actions/list.action.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.listAction = void 0;
const tslib_1 = __webpack_require__("tslib");
const utils_1 = __webpack_require__("./apps/cli/src/utils.ts");
function listAction() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { clickUp } = yield (0, utils_1.getInfoFromArgv)();
        console.log(yield clickUp.getFullTaskName());
    });
}
exports.listAction = listAction;


/***/ }),

/***/ "./apps/cli/src/actions/meeting-track.action.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.meetingTrackAction = void 0;
const tslib_1 = __webpack_require__("tslib");
const node_shared_1 = __webpack_require__("./libs/node-shared/src/index.ts");
const child_process_1 = __webpack_require__("child_process");
const cron_1 = __webpack_require__("cron");
const date_fns_1 = __webpack_require__("date-fns");
const open_1 = tslib_1.__importDefault(__webpack_require__("open"));
const utils_1 = __webpack_require__("./apps/cli/src/utils.ts");
function meetingTrackAction() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        // get today meetings
        const day = (0, utils_1.getDayFromArgv)();
        const g = new node_shared_1.Google();
        const todayMeetings = yield g.listAttendingEvent(day.toISOString(), (0, date_fns_1.add)(day, { days: 1 }).toISOString());
        // print today meetings and times and meeting link
        for (const m of todayMeetings) {
            console.log(`- ${(0, date_fns_1.format)((0, date_fns_1.parseISO)(m.start.dateTime), 'Pp')}: ${m.summary}`);
        }
        // setup cron job for opening meeting link
        todayMeetings.forEach((m) => {
            const openTime = (0, date_fns_1.add)((0, date_fns_1.parseISO)(m.start.dateTime), { minutes: -5 });
            if ((0, date_fns_1.isBefore)(openTime, day)) {
                return;
            }
            const job = new cron_1.CronJob(openTime, () => {
                (0, child_process_1.execSync)(`osascript -e 'display notification "Meeting: ${m.summary} at ${(0, date_fns_1.format)((0, date_fns_1.parseISO)(m.start.dateTime), 'Pp')}" with title "Accel Shooter"'`);
                (0, open_1.default)(m.hangoutLink + '?authuser=1');
            });
            job.start();
        });
    });
}
exports.meetingTrackAction = meetingTrackAction;


/***/ }),

/***/ "./apps/cli/src/actions/open.action.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.openAction = void 0;
const tslib_1 = __webpack_require__("tslib");
const utils_1 = __webpack_require__("./apps/cli/src/utils.ts");
function openAction() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { clickUpTaskId } = yield (0, utils_1.getInfoFromArgv)();
        const urls = [`localhost:8112/task/${clickUpTaskId}`];
        (0, utils_1.openUrlsInTabGroup)(urls, clickUpTaskId);
    });
}
exports.openAction = openAction;


/***/ }),

/***/ "./apps/cli/src/actions/revert-end.action.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.revertEndAction = void 0;
const tslib_1 = __webpack_require__("tslib");
const progress_log_class_1 = __webpack_require__("./apps/cli/src/classes/progress-log.class.ts");
const utils_1 = __webpack_require__("./apps/cli/src/utils.ts");
function revertEndAction() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { gitLab, mergeRequest, clickUp } = yield (0, utils_1.getInfoFromArgv)();
        const p = new progress_log_class_1.CustomProgressLog("End", [
            "Update GitLab Merge Request Ready Status and Assignee",
            "Update ClickUp Task Status",
        ]);
        p.start();
        yield gitLab.markMergeRequestAsUnreadyAndSetAssigneeToSelf(mergeRequest);
        p.next();
        yield clickUp.setTaskStatus("in progress");
        p.end(0);
    });
}
exports.revertEndAction = revertEndAction;


/***/ }),

/***/ "./apps/cli/src/actions/routine.action.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.punch = exports.routineAction = exports.confirm = void 0;
const tslib_1 = __webpack_require__("tslib");
const fs_1 = tslib_1.__importDefault(__webpack_require__("fs"));
const puppeteer_1 = tslib_1.__importDefault(__webpack_require__("puppeteer"));
const node_shared_1 = __webpack_require__("./libs/node-shared/src/index.ts");
const readline_1 = tslib_1.__importDefault(__webpack_require__("readline"));
const holiday_class_1 = __webpack_require__("./apps/cli/src/classes/holiday.class.ts");
const utils_1 = __webpack_require__("./apps/cli/src/utils.ts");
const daily_progress_action_1 = __webpack_require__("./apps/cli/src/actions/daily-progress.action.ts");
const dump_my_tasks_action_1 = __webpack_require__("./apps/cli/src/actions/dump-my-tasks.action.ts");
function confirm(question) {
    return new Promise((resolve, reject) => {
        const prompt = readline_1.default.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        prompt.question(question + ' (y/n) ', function (answer) {
            if (answer === 'y' || answer === 'Y') {
                prompt.close();
                resolve();
            }
            else {
                reject();
            }
        });
    });
}
exports.confirm = confirm;
function routineAction() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const day = (0, utils_1.getDayFromArgv)();
        const hour = day.getHours();
        const isMorning = hour < 12;
        const holiday = new holiday_class_1.Holiday();
        const isWorkDay = holiday.checkIsWorkday(day);
        const message = isWorkDay ? 'Today is workday!' : 'Today is holiday!';
        console.log(message);
        if (isWorkDay) {
            yield confirm('run punch?');
            const result = yield punch();
            console.log(result);
        }
        if (isMorning) {
            if (isWorkDay) {
                yield confirm('isa done?');
                yield confirm('run dump my tasks?');
                yield (0, dump_my_tasks_action_1.dumpMyTasksAction)();
                yield confirm('check tasks done?');
                yield confirm('check todo done?');
                yield confirm('run daily progress?');
                yield (0, daily_progress_action_1.dailyProgressAction)();
                yield confirm('send dp to slack done?');
            }
        }
        console.log('Complete');
    });
}
exports.routineAction = routineAction;
function punch() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { account, password, url } = JSON.parse(fs_1.default.readFileSync(node_shared_1.CONFIG.PunchInfoFile, { encoding: 'utf-8' }));
        const browser = yield puppeteer_1.default.launch({
            headless: false,
        });
        const page = yield browser.newPage();
        yield page.goto(url);
        yield page.evaluate((a, p) => {
            const userName = document.querySelector('#user_username');
            if (userName) {
                userName.value = a;
            }
            const userPassword = document.querySelector('#user_passwd');
            if (userPassword) {
                userPassword.value = p;
            }
            const button = document.querySelector('#s_buttom');
            if (button) {
                button.click();
            }
        }, account, password);
        yield page.waitForNavigation();
        const hour = new Date().getHours();
        yield page.evaluate((h) => {
            const punchInputs = document.querySelectorAll('.clock_enabled');
            const punchTimes = document.querySelectorAll('#clock_listing td:nth-child(2)');
            if (!punchTimes[0].textContent || !punchTimes[1].textContent) {
                return;
            }
            const start = punchTimes[0].textContent.replace(/[\s\n]/g, '');
            const end = punchTimes[1].textContent.replace(/[\s\n]/g, '');
            if (h > 7 && h < 11 && start === '') {
                punchInputs[0].click();
            }
            else if (h > 16 && h < 20 && end === '') {
                punchInputs[1].click();
            }
        }, hour);
        yield page.waitForFunction((h) => {
            const punchTimes = document.querySelectorAll('#clock_listing td:nth-child(2)');
            if (!punchTimes[0].textContent || !punchTimes[1].textContent) {
                return;
            }
            const start = punchTimes[0].textContent.replace(/[\s\n]/g, '');
            const end = punchTimes[1].textContent.replace(/[\s\n]/g, '');
            if (h > 7 && h < 11) {
                return start !== '';
            }
            else if (h > 16 && h < 20) {
                return end !== '';
            }
        }, {}, hour);
        const result = yield page.evaluate(() => {
            const punchTimes = document.querySelectorAll('#clock_listing td:nth-child(2)');
            if (!punchTimes[0].textContent || !punchTimes[1].textContent) {
                return;
            }
            const start = punchTimes[0].textContent.replace(/[\s\n]/g, '');
            const end = punchTimes[1].textContent.replace(/[\s\n]/g, '');
            return [start, end];
        });
        yield (0, node_shared_1.sleep)(3000);
        yield browser.close();
        return result;
    });
}
exports.punch = punch;


/***/ }),

/***/ "./apps/cli/src/actions/rtv-tasks.action.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RTVTasksAction = void 0;
const tslib_1 = __webpack_require__("tslib");
const node_shared_1 = __webpack_require__("./libs/node-shared/src/index.ts");
function RTVTasksAction() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const user = (yield node_shared_1.ClickUp.getCurrentUser()).user;
        const team = (yield node_shared_1.ClickUp.getTeams()).teams.find((t) => t.name === node_shared_1.CONFIG.ClickUpTeam);
        if (!team) {
            console.log("Team does not exist.");
            return;
        }
        const tasks = (yield node_shared_1.ClickUp.getRTVTasks(team.id, user.id)).tasks;
        console.log(tasks.map((t) => `- ${t.name} (${t.url})`).join("\n"));
    });
}
exports.RTVTasksAction = RTVTasksAction;


/***/ }),

/***/ "./apps/cli/src/actions/show-diff.action.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.showDiffAction = void 0;
const tslib_1 = __webpack_require__("tslib");
const utils_1 = __webpack_require__("./apps/cli/src/utils.ts");
function showDiffAction() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const htmlOnly = process.argv.includes("-h") || process.argv.includes("--html");
        const pythonOnly = process.argv.includes("-p") || process.argv.includes("--python");
        process.argv = process.argv.filter((a) => !a.startsWith("-"));
        const { gitLab, mergeRequest } = yield (0, utils_1.getInfoFromArgv)();
        const mergeRequestChanges = yield gitLab.getMergeRequestChanges(mergeRequest.iid);
        const changes = mergeRequestChanges.changes;
        let filteredChanges = [];
        if (htmlOnly) {
            filteredChanges = [
                ...filteredChanges,
                ...changes.filter((c) => c.new_path.endsWith(".html")),
            ];
        }
        if (pythonOnly) {
            filteredChanges = [
                ...filteredChanges,
                ...changes.filter((c) => c.new_path.endsWith(".py")),
            ];
        }
        for (const change of filteredChanges) {
            console.log(`### ${change.new_path}`);
            console.log(change.diff);
        }
    });
}
exports.showDiffAction = showDiffAction;


/***/ }),

/***/ "./apps/cli/src/actions/start.action.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.startAction = void 0;
const tslib_1 = __webpack_require__("tslib");
const fs_1 = __webpack_require__("fs");
const inquirer_1 = tslib_1.__importDefault(__webpack_require__("inquirer"));
const mustache_1 = __webpack_require__("mustache");
const os_1 = tslib_1.__importDefault(__webpack_require__("os"));
const path_1 = __webpack_require__("path");
const untildify_1 = tslib_1.__importDefault(__webpack_require__("untildify"));
const node_shared_1 = __webpack_require__("./libs/node-shared/src/index.ts");
const progress_log_class_1 = __webpack_require__("./apps/cli/src/classes/progress-log.class.ts");
const todo_class_1 = __webpack_require__("./apps/cli/src/classes/todo.class.ts");
const tracker_class_1 = __webpack_require__("./apps/cli/src/classes/tracker.class.ts");
const utils_1 = __webpack_require__("./apps/cli/src/utils.ts");
const open_action_1 = __webpack_require__("./apps/cli/src/actions/open.action.ts");
function startAction() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const repoName = (0, utils_1.getRepoName)();
        const index = node_shared_1.CONFIG.GitLabProjects.findIndex((p) => p.repo.endsWith(`/${repoName}`));
        const answers = yield inquirer_1.default.prompt([
            {
                name: 'gitLabProject',
                message: 'Choose GitLab Project',
                type: 'list',
                choices: node_shared_1.CONFIG.GitLabProjects.map((p) => ({
                    name: `${p.name} (${p.repo})`,
                    value: p,
                })),
                default: index >= 0 ? index : null,
                filter(input) {
                    return tslib_1.__awaiter(this, void 0, void 0, function* () {
                        process.chdir(input.path.replace('~', os_1.default.homedir()));
                        const isClean = yield (0, utils_1.checkWorkingTreeClean)();
                        if (!isClean) {
                            console.log('\nWorking tree is not clean or something is not pushed. Aborted.');
                            process.exit();
                        }
                        return input;
                    });
                },
            },
            {
                name: 'clickUpTaskId',
                message: 'Enter ClickUp Task ID',
                type: 'input',
                filter: (input) => input.replace('#', ''),
            },
            {
                name: 'mergeRequestTitle',
                message: 'Enter Merge Request Title',
                type: 'input',
                default: (answers) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    let task = yield new node_shared_1.ClickUp(answers.clickUpTaskId).getTask();
                    const user = (yield node_shared_1.ClickUp.getCurrentUser()).user;
                    if (!task.assignees.find((a) => a.id === user.id)) {
                        console.log('\nTask is not assigned to you. Aborted.');
                        process.exit();
                    }
                    if (answers.gitLabProject.products) {
                        const product = yield node_shared_1.ClickUp.getProduct(task);
                        if (!answers.gitLabProject.products.includes(product)) {
                            console.log('\nTask is not in products of project. Aborted.');
                            process.exit();
                        }
                    }
                    let result = task.name;
                    while (task.parent) {
                        task = yield new node_shared_1.ClickUp(task.parent).getTask();
                        result = `${task.name} - ${result}`;
                    }
                    return result;
                }),
            },
            {
                name: 'todoConfig',
                message: 'Choose Preset To-do Config',
                type: 'checkbox',
                choices: node_shared_1.CONFIG.ToDoConfigChoices,
            },
        ]);
        const p = new progress_log_class_1.CustomProgressLog('Start', [
            'Get ClickUp Task',
            'Set ClickUp Task Status',
            'Render Todo List',
            'Create GitLab Branch',
            'Create GitLab Merge Request',
            'Create Checklist at ClickUp',
            'Add Todo Entry',
            'Add Tracker Item',
            'Do Git Fetch and Checkout',
        ]);
        process.chdir(answers.gitLabProject.path.replace('~', os_1.default.homedir()));
        yield (0, utils_1.checkWorkingTreeClean)();
        const gitLab = new node_shared_1.GitLab(answers.gitLabProject.id);
        const clickUp = new node_shared_1.ClickUp(answers.clickUpTaskId);
        p.start(); // Get ClickUp Task
        const clickUpTask = yield clickUp.getTask();
        const clickUpTaskUrl = clickUpTask['url'];
        const gitLabMergeRequestTitle = answers.mergeRequestTitle;
        p.next(); // Set ClickUp Task Status
        yield clickUp.setTaskStatus('in progress');
        p.next(); // Render Todo List
        const todoConfigMap = {};
        answers.todoConfig.forEach((c) => {
            todoConfigMap[c] = true;
        });
        todoConfigMap[answers.gitLabProject.name] = true;
        const template = (0, fs_1.readFileSync)((0, untildify_1.default)(node_shared_1.CONFIG.ToDoTemplate), {
            encoding: 'utf-8',
        });
        const endingTodo = (0, mustache_1.render)(template, todoConfigMap);
        const path = (0, path_1.join)(node_shared_1.CONFIG.TaskTodoFolder, answers.clickUpTaskId + '.md');
        (0, fs_1.writeFileSync)(path, endingTodo);
        p.next(); // Create GitLab Branch
        const gitLabBranch = yield gitLab.createBranch(`CU-${answers.clickUpTaskId}`);
        p.next(); // Create GitLab Merge Request
        yield (0, node_shared_1.sleep)(2000); // prevent "branch restored" bug
        const gitLabMergeRequest = yield gitLab.createMergeRequest(gitLabMergeRequestTitle + `__CU-${answers.clickUpTaskId}`, gitLabBranch.name, answers.gitLabProject.hasMergeRequestTemplate
            ? yield gitLab.getMergeRequestTemplate()
            : '');
        const gitLabMergeRequestIId = gitLabMergeRequest.iid;
        yield gitLab.createMergeRequestNote(gitLabMergeRequest, `ClickUp Task: [${gitLabMergeRequestTitle}](${clickUpTaskUrl})`);
        p.next(); // Create Checklist at ClickUp
        const clickUpChecklistTitle = `Synced checklist [${answers.gitLabProject.id.replace('%2F', '/')} !${gitLabMergeRequestIId}]`;
        let clickUpChecklist = clickUpTask.checklists.find((c) => c.name === clickUpChecklistTitle);
        if (!clickUpChecklist) {
            clickUpChecklist = (yield clickUp.createChecklist(clickUpChecklistTitle))
                .checklist;
            yield clickUp.updateChecklist(clickUpChecklist, endingTodo);
        }
        p.next(); // Add Todo Entry
        const todoString = yield clickUp.getTaskString('todo');
        new todo_class_1.Todo().addTodo(todoString);
        p.next(); // Add Tracker Item
        new tracker_class_1.Tracker().addItem(answers.clickUpTaskId);
        p.next(); // Do Git Fetch and Checkout
        process.chdir(answers.gitLabProject.path.replace('~', os_1.default.homedir()));
        yield (0, utils_1.promiseSpawn)('git', ['fetch'], 'pipe');
        yield (0, node_shared_1.sleep)(1000);
        yield (0, utils_1.promiseSpawn)('git', ['checkout', gitLabBranch.name], 'pipe');
        yield (0, utils_1.promiseSpawn)('git', ['submodule', 'update', '--init', '--recursive'], 'pipe');
        yield (0, open_action_1.openAction)();
        p.end(0);
    });
}
exports.startAction = startAction;


/***/ }),

/***/ "./apps/cli/src/actions/switch.action.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.switchAction = void 0;
const tslib_1 = __webpack_require__("tslib");
const child_process_1 = __webpack_require__("child_process");
const os_1 = tslib_1.__importDefault(__webpack_require__("os"));
const actions_1 = __webpack_require__("./apps/cli/src/actions.ts");
const utils_1 = __webpack_require__("./apps/cli/src/utils.ts");
const open_action_1 = __webpack_require__("./apps/cli/src/actions/open.action.ts");
function switchAction() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        (0, actions_1.configReadline)();
        const { gitLabProject, mergeRequest } = yield (0, utils_1.getInfoFromArgv)();
        if (mergeRequest.state === "merged") {
            console.log("This task is completed.");
            return;
        }
        process.chdir(gitLabProject.path.replace("~", os_1.default.homedir()));
        const branchName = (0, child_process_1.execSync)("git branch --show-current", {
            encoding: "utf-8",
        });
        if (branchName.trim() !== mergeRequest.source_branch) {
            const isClean = yield (0, utils_1.checkWorkingTreeClean)();
            if (!isClean) {
                console.log("\nWorking tree is not clean or something is not pushed. Aborted.");
                process.exit();
            }
            yield (0, utils_1.promiseSpawn)("git", ["checkout", mergeRequest.source_branch], "pipe");
            yield (0, open_action_1.openAction)();
        }
    });
}
exports.switchAction = switchAction;


/***/ }),

/***/ "./apps/cli/src/actions/time.action.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.timeAction = void 0;
const tslib_1 = __webpack_require__("tslib");
const clipboardy_1 = tslib_1.__importDefault(__webpack_require__("clipboardy"));
const date_fns_1 = __webpack_require__("date-fns");
function timeAction() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        clipboardy_1.default.writeSync((0, date_fns_1.format)(new Date(), 'yyyyMMdd_HHmmss'));
        console.log('Copied!');
    });
}
exports.timeAction = timeAction;


/***/ }),

/***/ "./apps/cli/src/actions/to-do.action.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.toDoAction = void 0;
const tslib_1 = __webpack_require__("tslib");
const node_shared_1 = __webpack_require__("./libs/node-shared/src/index.ts");
const clipboardy_1 = tslib_1.__importDefault(__webpack_require__("clipboardy"));
const fs_1 = __webpack_require__("fs");
const inquirer_1 = tslib_1.__importDefault(__webpack_require__("inquirer"));
const mustache_1 = __webpack_require__("mustache");
const untildify_1 = tslib_1.__importDefault(__webpack_require__("untildify"));
function toDoAction() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const answers = yield inquirer_1.default.prompt([
            {
                name: "gitLabProject",
                message: "Choose GitLab Project",
                type: "list",
                choices: node_shared_1.CONFIG.GitLabProjects.map((p) => ({
                    name: `${p.name} (${p.repo})`,
                    value: p,
                })),
            },
            {
                name: "todoConfig",
                message: "Choose Preset To-do Config",
                type: "checkbox",
                choices: node_shared_1.CONFIG.ToDoConfigChoices,
            },
        ]);
        const todoConfigMap = {};
        answers.todoConfig.forEach((c) => {
            todoConfigMap[c] = true;
        });
        todoConfigMap[answers.gitLabProject.name] = true;
        const template = (0, fs_1.readFileSync)((0, untildify_1.default)(node_shared_1.CONFIG.ToDoTemplate), {
            encoding: "utf-8",
        });
        const endingTodo = (0, mustache_1.render)(template, todoConfigMap);
        clipboardy_1.default.writeSync(endingTodo);
        console.log(endingTodo);
        console.log("Copied!");
    });
}
exports.toDoAction = toDoAction;


/***/ }),

/***/ "./apps/cli/src/actions/track.action.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.trackAction = void 0;
const tslib_1 = __webpack_require__("tslib");
const single_instance_lock_1 = __webpack_require__("single-instance-lock");
const tracker_class_1 = __webpack_require__("./apps/cli/src/classes/tracker.class.ts");
const locker = new single_instance_lock_1.SingleInstanceLock('accel-shooter');
function trackAction() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        locker.lock(single_instance_lock_1.LockType.First);
        locker.on('locked', () => {
            const tracker = new tracker_class_1.Tracker();
            tracker.startSync();
        });
        locker.on('error', () => {
            console.log('Lock occupied!');
        });
    });
}
exports.trackAction = trackAction;


/***/ }),

/***/ "./apps/cli/src/actions/watch-pipeline.action.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.watchPipelineAction = void 0;
const tslib_1 = __webpack_require__("tslib");
const node_shared_1 = __webpack_require__("./libs/node-shared/src/index.ts");
const child_process_1 = tslib_1.__importDefault(__webpack_require__("child_process"));
const utils_1 = __webpack_require__("./apps/cli/src/utils.ts");
function watchPipelineAction() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const projectName = process.argv[3];
        const mergeRequestIId = process.argv[4];
        const gitLabProject = (0, utils_1.getGitLabProjectConfigByName)(projectName);
        const gitLab = new node_shared_1.GitLab(gitLabProject.id);
        function getAndPrintPipelineStatus() {
            var _a;
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const mergeRequest = yield gitLab.getMergeRequest(mergeRequestIId);
                const status = ((_a = mergeRequest.head_pipeline) === null || _a === void 0 ? void 0 : _a.status) || 'none';
                console.log(status);
                if (status !== 'running' && status !== 'none') {
                    const message = `Pipeline of ${projectName} !${mergeRequestIId} status: ${status}`;
                    child_process_1.default.execSync(`osascript -e 'display notification "${message
                        .replace(/"/g, '')
                        .replace(/'/g, '')}" with title "Accel Shooter"'`);
                    process.exit();
                }
            });
        }
        getAndPrintPipelineStatus();
        setInterval(getAndPrintPipelineStatus, 30 * 1000);
    });
}
exports.watchPipelineAction = watchPipelineAction;


/***/ }),

/***/ "./apps/cli/src/actions/work.action.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.workAction = void 0;
const tslib_1 = __webpack_require__("tslib");
const node_shared_1 = __webpack_require__("./libs/node-shared/src/index.ts");
const kexec_1 = tslib_1.__importDefault(__webpack_require__("@jcoreio/kexec"));
const todo_class_1 = __webpack_require__("./apps/cli/src/classes/todo.class.ts");
const utils_1 = __webpack_require__("./apps/cli/src/utils.ts");
function workAction() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const todo = new todo_class_1.Todo();
        const todoContent = todo.readFile();
        let matchResult = todoContent.match(/## Todo\n([\s\S]+)\n##/);
        if (!matchResult) {
            throw Error('Todo File Broken');
        }
        const todoList = matchResult[1].split('\n');
        const firstTodo = todoList[0];
        matchResult = firstTodo.match(/https:\/\/app.clickup.com\/t\/(\w+)\)/);
        if (!matchResult) {
            throw Error('First Todo is not a ClickUp task');
        }
        const clickUpTaskId = matchResult[1];
        const clickUp = new node_shared_1.ClickUp(clickUpTaskId);
        const { gitLabProject } = yield clickUp.getGitLabProjectAndMergeRequestIId();
        // Open Task Page
        const urls = [`localhost:8112/task/${clickUpTaskId}`];
        (0, utils_1.openUrlsInTabGroup)(urls, clickUpTaskId);
        // Open tmux
        const folder = gitLabProject.path;
        const shortName = gitLabProject.shortName;
        (0, kexec_1.default)(`cd ${folder}; tmux new -A -d -s ${shortName} -c ${folder}; tmux new -A -D -s ${shortName}`);
    });
}
exports.workAction = workAction;


/***/ }),

/***/ "./apps/cli/src/classes/base-file-ref.class.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseFileRef = void 0;
const fs_1 = __webpack_require__("fs");
class BaseFileRef {
    readFile() {
        return (0, fs_1.readFileSync)(this.path, { encoding: 'utf-8' });
    }
    writeFile(content) {
        (0, fs_1.writeFileSync)(this.path, content);
    }
}
exports.BaseFileRef = BaseFileRef;


/***/ }),

/***/ "./apps/cli/src/classes/check-item.class.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CheckItem = void 0;
const tslib_1 = __webpack_require__("tslib");
const rxjs_1 = __webpack_require__("rxjs");
const operators_1 = __webpack_require__("rxjs/operators");
const utils_1 = __webpack_require__("./apps/cli/src/utils.ts");
class CheckItem {
    constructor(group, name, defaultChecked, run, stdoutReducer) {
        this.group = group;
        this.name = name;
        this.defaultChecked = defaultChecked;
        this.run = run;
        this.stdoutReducer = stdoutReducer;
        this.displayName = `[${this.group}] ${this.name}`;
    }
    static fromProjectCheckItem({ group, name, command, args, }) {
        return new CheckItem(group, name, false, () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            return (0, utils_1.promiseSpawn)(command, args, "pipe");
        }));
    }
    getObs(context) {
        return (0, rxjs_1.concat)((0, rxjs_1.of)({
            group: this.group,
            name: this.name,
            code: -1,
            stdout: "",
            stderr: "",
        }), (0, rxjs_1.defer)(() => this.run(context)).pipe((0, operators_1.map)((d) => {
            const result = d;
            result.group = this.group;
            result.name = this.name;
            if (this.stdoutReducer && result.stdout) {
                result.stdout = this.stdoutReducer(result.stdout);
            }
            return result;
        })));
    }
}
exports.CheckItem = CheckItem;


/***/ }),

/***/ "./apps/cli/src/classes/checker.class.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Checker = void 0;
const tslib_1 = __webpack_require__("tslib");
const node_shared_1 = __webpack_require__("./libs/node-shared/src/index.ts");
const fs_1 = __webpack_require__("fs");
const inquirer_1 = tslib_1.__importDefault(__webpack_require__("inquirer"));
const os_1 = tslib_1.__importDefault(__webpack_require__("os"));
const rxjs_1 = __webpack_require__("rxjs");
const untildify_1 = tslib_1.__importDefault(__webpack_require__("untildify"));
const utils_1 = __webpack_require__("./apps/cli/src/utils.ts");
const check_items_const_1 = __webpack_require__("./apps/cli/src/consts/check-items.const.ts");
const check_item_class_1 = __webpack_require__("./apps/cli/src/classes/check-item.class.ts");
const SPINNER = [
    '🕛',
    '🕐',
    '🕑',
    '🕒',
    '🕓',
    '🕔',
    '🕕',
    '🕖',
    '🕗',
    '🕘',
    '🕙',
    '🕚',
];
class Checker {
    constructor(gitLabProject, mergeRequestIId, selectMode) {
        this.gitLabProject = gitLabProject;
        this.mergeRequestIId = mergeRequestIId;
        this.selectMode = selectMode;
        this.gitLabProjectId = this.gitLabProject.id;
        this.gitLab = new node_shared_1.GitLab(this.gitLabProjectId);
    }
    start() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const mergeRequest = yield this.gitLab.getMergeRequest(this.mergeRequestIId);
            const mergeRequestChanges = yield this.gitLab.getMergeRequestChanges(this.mergeRequestIId);
            process.chdir(this.gitLabProject.path.replace('~', os_1.default.homedir()));
            yield (0, utils_1.promiseSpawn)('git', ['checkout', mergeRequest.source_branch], 'pipe');
            const changes = mergeRequestChanges.changes;
            let frontendChanges = [];
            let backendChanges = [];
            switch (this.gitLabProject.projectType) {
                case 'full':
                    frontendChanges = changes.filter((c) => c.new_path.startsWith('frontend'));
                    backendChanges = changes.filter((c) => c.new_path.startsWith('backend'));
                    break;
                case 'frontend':
                    frontendChanges = changes;
                    break;
            }
            const checkItems = check_items_const_1.checkItemsMap[this.gitLabProject.projectType];
            const projectCheckItems = (this.gitLabProject.checkItems || []).map(check_item_class_1.CheckItem.fromProjectCheckItem);
            let runningItems = [...checkItems, ...projectCheckItems];
            if (frontendChanges.length === 0) {
                runningItems = runningItems.filter((item) => item.group !== 'Frontend');
            }
            if (backendChanges.length === 0) {
                runningItems = runningItems.filter((item) => item.group !== 'Backend');
            }
            if (this.selectMode) {
                const answers = yield inquirer_1.default.prompt([
                    {
                        name: 'selectedCheckItems',
                        message: 'Choose Check Items to Run',
                        type: 'checkbox',
                        choices: runningItems.map((r) => ({
                            name: r.displayName,
                            checked: r.defaultChecked,
                        })),
                        pageSize: runningItems.length,
                    },
                ]);
                runningItems = runningItems.filter((r) => answers.selectedCheckItems.includes(r.displayName));
            }
            const context = {
                mergeRequest,
                gitLab: this.gitLab,
                frontendChanges,
                backendChanges,
            };
            const obss = runningItems.map((r) => r.getObs(context));
            const checkStream = (0, rxjs_1.combineLatest)(obss);
            process.stdout.write(runningItems.map(() => '').join('\n'));
            const stream = (0, rxjs_1.combineLatest)([(0, rxjs_1.interval)(60), checkStream]).subscribe(([count, statusList]) => {
                process.stdout.moveCursor(0, -statusList.length + 1);
                process.stdout.cursorTo(0);
                process.stdout.clearScreenDown();
                process.stdout.write(statusList
                    .map((s) => {
                    let emoji = '';
                    switch (s.code) {
                        case -1:
                            emoji = SPINNER[count % SPINNER.length];
                            break;
                        case 0:
                            emoji = '✅';
                            break;
                        case 1:
                            emoji = '❌';
                            break;
                        default:
                            emoji = '🔴';
                    }
                    return `${emoji} [${s.group}] ${s.name}`;
                })
                    .join('\n'));
                if (statusList.every((s) => s.code !== -1)) {
                    stream.unsubscribe();
                    const nonSuccessStatusList = statusList.filter((s) => s.code !== 0);
                    if (nonSuccessStatusList.length > 0) {
                        (0, fs_1.writeFile)((0, untildify_1.default)('~/ac-checker-log'), nonSuccessStatusList
                            .map((s) => `###### [${s.group}] ${s.name} ${s.code}\n${s.stdout}\n${s.stderr}`)
                            .join('\n\n'), () => { });
                    }
                    console.log('');
                }
            });
        });
    }
}
exports.Checker = Checker;


/***/ }),

/***/ "./apps/cli/src/classes/commit-scope.class.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommitScope = void 0;
const tslib_1 = __webpack_require__("tslib");
const node_shared_1 = __webpack_require__("./libs/node-shared/src/index.ts");
const js_yaml_1 = tslib_1.__importDefault(__webpack_require__("js-yaml"));
const untildify_1 = tslib_1.__importDefault(__webpack_require__("untildify"));
const base_file_ref_class_1 = __webpack_require__("./apps/cli/src/classes/base-file-ref.class.ts");
class CommitScope extends base_file_ref_class_1.BaseFileRef {
    get path() {
        return (0, untildify_1.default)(node_shared_1.CONFIG.CommitScopeFile);
    }
    getItems(repoName) {
        const commitScopeDict = js_yaml_1.default.load(this.readFile());
        const items = commitScopeDict[repoName] || [];
        items.unshift('empty');
        return items;
    }
}
exports.CommitScope = CommitScope;


/***/ }),

/***/ "./apps/cli/src/classes/daily-progress.class.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DailyProgress = void 0;
const tslib_1 = __webpack_require__("tslib");
const node_shared_1 = __webpack_require__("./libs/node-shared/src/index.ts");
const untildify_1 = tslib_1.__importDefault(__webpack_require__("untildify"));
const base_file_ref_class_1 = __webpack_require__("./apps/cli/src/classes/base-file-ref.class.ts");
class DailyProgress extends base_file_ref_class_1.BaseFileRef {
    get path() {
        return (0, untildify_1.default)(node_shared_1.CONFIG.DailyProgressFile);
    }
    addProgressToBuffer(dailyProgressString) {
        const content = this.readFile();
        const updatedDpContent = content.replace('## Buffer End', `    ${dailyProgressString}\n## Buffer End`);
        this.writeFile(updatedDpContent);
    }
    addDayProgress(dayProgress) {
        const content = this.readFile();
        const updatedDpContent = content.replace('## DP List', `## DP List\n${dayProgress}`);
        this.writeFile(updatedDpContent);
    }
    getRecordByDay(day) {
        const content = this.readFile();
        const matchResult = content.match(new RegExp(`(### ${day}.*?)\n###`, 's'));
        if (matchResult) {
            const record = matchResult[1];
            if (/2\. Today\n3\./.test(record)) {
                console.log('Today content is empty.');
                return null;
            }
            else {
                return record;
            }
        }
        else {
            console.log('DP record does not exist.');
            return null;
        }
    }
    writeRecordByDay(day, record) {
        const oldRecord = this.getRecordByDay(day);
        if (oldRecord) {
            const content = this.readFile();
            const newContent = content.replace(oldRecord, record);
            this.writeFile(newContent);
        }
    }
}
exports.DailyProgress = DailyProgress;


/***/ }),

/***/ "./apps/cli/src/classes/holiday.class.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Holiday = void 0;
const tslib_1 = __webpack_require__("tslib");
const untildify_1 = tslib_1.__importDefault(__webpack_require__("untildify"));
const node_shared_1 = __webpack_require__("./libs/node-shared/src/index.ts");
const date_fns_1 = __webpack_require__("date-fns");
const base_file_ref_class_1 = __webpack_require__("./apps/cli/src/classes/base-file-ref.class.ts");
class Holiday extends base_file_ref_class_1.BaseFileRef {
    constructor() {
        super();
        this.data = JSON.parse(this.readFile());
    }
    get path() {
        return (0, untildify_1.default)(node_shared_1.CONFIG.HolidayFile);
    }
    checkIsWorkday(day) {
        const dayString = (0, node_shared_1.formatDate)(day, node_shared_1.DateFormat.HOLIDAY);
        const h = this.data.find((d) => d.date === dayString);
        return (!h ||
            (h.isHoliday === '否' && h.name !== '勞動節') ||
            (h.name === '軍人節' && h.holidayCategory === '特定節日'));
    }
    getPreviousWorkday(day) {
        let previousDay = (0, date_fns_1.add)(day, { days: -1 });
        while (!this.checkIsWorkday(previousDay)) {
            previousDay = (0, date_fns_1.add)(previousDay, { days: -1 });
        }
        return previousDay;
    }
}
exports.Holiday = Holiday;


/***/ }),

/***/ "./apps/cli/src/classes/progress-log.class.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CustomProgressLog = void 0;
const tslib_1 = __webpack_require__("tslib");
const progress_logs_1 = tslib_1.__importDefault(__webpack_require__("progress-logs"));
var StopExitCode;
(function (StopExitCode) {
    StopExitCode[StopExitCode["success"] = 0] = "success";
    StopExitCode[StopExitCode["fail"] = 1] = "fail";
    StopExitCode[StopExitCode["warning"] = 2] = "warning";
})(StopExitCode || (StopExitCode = {}));
class CustomProgressLog extends progress_logs_1.default {
    constructor(title, titles) {
        super({ title, loadingEffect: 18 });
        this.setGlobalLogColor({
            success: "green",
        });
        this.setGlobalLogEmoji({
            fail: "x",
        });
        titles.forEach((title, index) => {
            this.add(title, undefined, {
                emoji: { success: index % 2 === 0 ? "rabbit" : "carrot" },
            });
        });
    }
    next(exitCode = StopExitCode.success) {
        var _a;
        (_a = this.currentLogItem) === null || _a === void 0 ? void 0 : _a.stop(exitCode);
        this.run();
    }
}
exports.CustomProgressLog = CustomProgressLog;


/***/ }),

/***/ "./apps/cli/src/classes/todo.class.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Todo = void 0;
const tslib_1 = __webpack_require__("tslib");
const fs_1 = __webpack_require__("fs");
const untildify_1 = tslib_1.__importDefault(__webpack_require__("untildify"));
const uuid_1 = __webpack_require__("uuid");
const node_shared_1 = __webpack_require__("./libs/node-shared/src/index.ts");
const base_file_ref_class_1 = __webpack_require__("./apps/cli/src/classes/base-file-ref.class.ts");
class Todo extends base_file_ref_class_1.BaseFileRef {
    get path() {
        return (0, untildify_1.default)(node_shared_1.CONFIG.TodoFile);
    }
    writeFile(content) {
        super.writeFile(content);
        (0, fs_1.writeFileSync)((0, untildify_1.default)(node_shared_1.CONFIG.TodoChangeNotificationFile), (0, uuid_1.v4)());
    }
    addTodo(todoString) {
        const content = this.readFile();
        const updatedTodoContent = content.replace('## Todo', `## Todo\n${todoString}`);
        this.writeFile(updatedTodoContent);
    }
    removeTodo(clickUpTaskId) {
        const todoContent = this.readFile();
        const matchResult = todoContent.match(/## Todo\n([\s\S]+)## Processing/);
        if (matchResult) {
            const todoList = matchResult[1].split('\n');
            const newTodoList = todoList.filter((t) => t && !t.includes(clickUpTaskId));
            const newTodoContent = todoContent.replace(matchResult[1], newTodoList.map((str) => str + '\n').join(''));
            this.writeFile(newTodoContent);
        }
        else {
            throw Error('Todo File Broken');
        }
    }
}
exports.Todo = Todo;


/***/ }),

/***/ "./apps/cli/src/classes/tracker.class.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Tracker = void 0;
const tslib_1 = __webpack_require__("tslib");
const node_shared_1 = __webpack_require__("./libs/node-shared/src/index.ts");
const child_process_1 = tslib_1.__importDefault(__webpack_require__("child_process"));
const fs_1 = __webpack_require__("fs");
const untildify_1 = tslib_1.__importDefault(__webpack_require__("untildify"));
const base_file_ref_class_1 = __webpack_require__("./apps/cli/src/classes/base-file-ref.class.ts");
class Tracker extends base_file_ref_class_1.BaseFileRef {
    get path() {
        return (0, untildify_1.default)(node_shared_1.CONFIG.TrackListFile);
    }
    startSync() {
        this.trackTask();
        setInterval(() => {
            this.trackTask();
        }, node_shared_1.CONFIG.TrackIntervalInMinutes * 60 * 1000);
    }
    addItem(clickUpTaskId) {
        (0, fs_1.appendFileSync)(this.path, `\n${clickUpTaskId}`);
    }
    getItems() {
        const content = this.readFile();
        return content
            .split('\n')
            .filter(Boolean)
            .filter((line) => !line.startsWith('#'));
    }
    trackTask() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            console.log(`[TrackNew] ${new Date().toLocaleString()}`);
            return Promise.all(this.getItems().map((clickUpTaskId) => this.trackSingle(clickUpTaskId)));
        });
    }
    trackSingle(clickUpTaskId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const clickUp = new node_shared_1.ClickUp(clickUpTaskId);
            const { gitLabProject, mergeRequestIId } = yield clickUp.getGitLabProjectAndMergeRequestIId();
            if (!(gitLabProject === null || gitLabProject === void 0 ? void 0 : gitLabProject.stagingStatus)) {
                return;
            }
            const gitLab = new node_shared_1.GitLab(gitLabProject.id);
            const mergeRequest = yield gitLab.getMergeRequest(mergeRequestIId);
            const clickUpTask = yield clickUp.getTask();
            if (['closed', 'verified', 'ready to verify', 'done'].includes(clickUpTask.status.status.toLowerCase())) {
                this.closeItem(clickUpTaskId);
                return;
            }
            if (gitLabProject.stagingStatus && mergeRequest.state === 'merged') {
                if (clickUpTask.status.status === 'in review') {
                    const list = yield node_shared_1.ClickUp.getList(clickUpTask.list.id);
                    let stagingStatus = gitLabProject.stagingStatus[list.name] ||
                        gitLabProject.stagingStatus['*'];
                    if (list.statuses.find((s) => s.status.toLowerCase() === stagingStatus)) {
                        yield clickUp.setTaskStatus(stagingStatus);
                    }
                    else if (list.statuses.find((s) => s.status.toLowerCase() === 'done')) {
                        stagingStatus = 'done';
                        yield clickUp.setTaskStatus('done');
                    }
                    else {
                        stagingStatus = 'closed';
                        yield clickUp.setTaskStatus('closed');
                    }
                    const message = `${yield clickUp.getFullTaskName()} (${clickUpTaskId}): In Review -> ${(0, node_shared_1.titleCase)(stagingStatus)}`;
                    child_process_1.default.execSync(`osascript -e 'display notification "${message
                        .replace(/"/g, '')
                        .replace(/'/g, '')}" with title "Accel Shooter"'`);
                    console.log(message);
                    this.closeItem(clickUpTaskId);
                }
            }
        });
    }
    closeItem(clickUpTaskId) {
        const content = this.readFile();
        const lines = content
            .split('\n')
            .filter(Boolean)
            .filter((line) => line !== clickUpTaskId);
        this.writeFile(lines.join('\n'));
    }
}
exports.Tracker = Tracker;


/***/ }),

/***/ "./apps/cli/src/consts/check-items.const.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.checkItemsMap = void 0;
const tslib_1 = __webpack_require__("tslib");
const check_item_class_1 = __webpack_require__("./apps/cli/src/classes/check-item.class.ts");
const utils_1 = __webpack_require__("./apps/cli/src/utils.ts");
const checkNonPushedChanges = new check_item_class_1.CheckItem("Global", "Check Non-Pushed Changes", true, () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, utils_1.promiseSpawn)("git", ["status"], "pipe");
    result.code =
        result.stdout.includes("Your branch is up to date with") &&
            result.stdout.includes("nothing to commit, working tree clean")
            ? 0
            : 1;
    return result;
}));
const checkConflict = new check_item_class_1.CheckItem("Global", "Check Conflict", true, ({ mergeRequest, gitLab }) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const fullMergeRequest = yield gitLab.getMergeRequest(mergeRequest.iid);
    const isConflict = fullMergeRequest.has_conflicts;
    return { code: isConflict ? 1 : 0 };
}));
const checkFrontendConsoleLog = new check_item_class_1.CheckItem("Frontend", "Check console.log", true, ({ frontendChanges }) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    return {
        code: frontendChanges.some((c) => c.new_path.endsWith(".ts") &&
            c.diff
                .split("\n")
                .some((line) => !line.startsWith("-") && line.includes("console.log")))
            ? 1
            : 0,
    };
}));
const checkFrontendLongImport = new check_item_class_1.CheckItem("Frontend", "Check long import", true, ({ frontendChanges }) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    return {
        code: frontendChanges.some((c) => c.new_path.endsWith(".ts") &&
            c.diff
                .split("\n")
                .some((line) => !line.startsWith("-") && line.includes("../../lib/")))
            ? 1
            : 0,
    };
}));
const checkBackendPrint = new check_item_class_1.CheckItem("Backend", "Check Print", true, ({ backendChanges }) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    return {
        code: backendChanges.some((c) => c.new_path.endsWith(".py") &&
            c.diff
                .split("\n")
                .some((line) => !line.startsWith("-") && line.includes("print(")))
            ? 1
            : 0,
    };
}));
const checkBackendDoubleQuotes = new check_item_class_1.CheckItem("Backend", "Check Double Quotes", true, ({ backendChanges }) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    return {
        code: backendChanges.some((c) => c.new_path.endsWith(".py") &&
            c.diff
                .split("\n")
                .some((line) => !line.startsWith("-") && line.includes('"')))
            ? 1
            : 0,
    };
}));
const checkBackendMigrationConflict = new check_item_class_1.CheckItem("Backend", "Check Migration Conflict", true, ({ mergeRequest, backendChanges, gitLab }) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (!backendChanges.some((c) => c.new_path.includes("migrations"))) {
        return { code: 0 };
    }
    const branchName = mergeRequest.source_branch;
    const defaultBranch = yield gitLab.getDefaultBranchName();
    const compare = yield gitLab.getCompare(defaultBranch, branchName);
    const migrationDiffs = compare.diffs.filter((d) => (d.new_file || d.deleted_file) && d.new_path.includes("migration"));
    const plusFiles = new Set(migrationDiffs
        .filter((d) => d.new_file)
        .map((d) => {
        const match = d.new_path.match(/backend\/(\w+)\/migrations\/(\d+)/);
        return match ? match[1] + "_" + match[2] : null;
    })
        .filter(Boolean));
    const minusFiles = new Set(migrationDiffs
        .filter((d) => d.deleted_file)
        .map((d) => {
        const match = d.new_path.match(/backend\/(\w+)\/migrations\/(\d+)/);
        return match ? match[1] + "_" + match[2] : null;
    })
        .filter(Boolean));
    return {
        code: [...plusFiles].filter((f) => minusFiles.has(f)).length > 0 ? 1 : 0,
    };
}));
const fullProjectCheckItems = [
    checkNonPushedChanges,
    checkConflict,
    checkFrontendConsoleLog,
    checkFrontendLongImport,
    checkBackendPrint,
    checkBackendDoubleQuotes,
    checkBackendMigrationConflict,
];
const frontendProjectCheckItems = [
    checkNonPushedChanges,
    checkConflict,
    checkFrontendConsoleLog,
    checkFrontendLongImport,
];
const otherProjectCheckItems = [
    checkNonPushedChanges,
    checkConflict,
];
exports.checkItemsMap = {
    full: fullProjectCheckItems,
    frontend: frontendProjectCheckItems,
    other: otherProjectCheckItems,
};


/***/ }),

/***/ "./apps/cli/src/utils.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getDayFromArgv = exports.getRepoName = exports.openUrlsInTabGroup = exports.checkWorkingTreeClean = exports.getInfoFromArgv = exports.updateTaskStatusInDp = exports.getClickUpTaskIdFromGitLabMergeRequest = exports.getGitLabProjectConfigById = exports.getGitLabProjectConfigByName = exports.promiseSpawn = void 0;
const tslib_1 = __webpack_require__("tslib");
const child_process_1 = tslib_1.__importStar(__webpack_require__("child_process"));
const open_1 = tslib_1.__importDefault(__webpack_require__("open"));
const qs_1 = tslib_1.__importDefault(__webpack_require__("qs"));
const node_shared_1 = __webpack_require__("./libs/node-shared/src/index.ts");
const date_fns_1 = __webpack_require__("date-fns");
function promiseSpawn(command, args, stdio = 'inherit') {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            var _a, _b;
            const child = child_process_1.default.spawn(command, args, {
                shell: true,
                stdio,
            });
            if (stdio === 'pipe') {
                let stdout = '';
                let stderr = '';
                (_a = child.stdout) === null || _a === void 0 ? void 0 : _a.on('data', (d) => {
                    const output = d.toString();
                    stdout += output;
                });
                (_b = child.stderr) === null || _b === void 0 ? void 0 : _b.on('data', (d) => {
                    const output = d.toString();
                    stderr += output;
                });
                child.on('close', (code) => {
                    resolve({ stdout, stderr, code });
                });
            }
            else {
                child.on('close', (code) => (code === 0 ? resolve(1) : reject()));
            }
            child.on('error', (err) => {
                console.log(err);
            });
        });
    });
}
exports.promiseSpawn = promiseSpawn;
function getGitLabProjectConfigByName(n) {
    return node_shared_1.CONFIG.GitLabProjects.find(({ name }) => name === n);
}
exports.getGitLabProjectConfigByName = getGitLabProjectConfigByName;
function getGitLabProjectConfigById(inputId) {
    return node_shared_1.CONFIG.GitLabProjects.find(({ id }) => id === inputId);
}
exports.getGitLabProjectConfigById = getGitLabProjectConfigById;
function getClickUpTaskIdFromGitLabMergeRequest(mergeRequest) {
    const branchName = mergeRequest.source_branch;
    const result = branchName.match(/CU-([a-z0-9]+)/);
    return result ? result[1] : null;
}
exports.getClickUpTaskIdFromGitLabMergeRequest = getClickUpTaskIdFromGitLabMergeRequest;
const dpItemRegex = /\* \([A-Za-z0-9 %]+\) \[.*?\]\(https:\/\/app.clickup.com\/t\/(\w+)\)/g;
function updateTaskStatusInDp(dp) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let match = null;
        let resultDp = dp;
        while ((match = dpItemRegex.exec(dp))) {
            const full = match[0];
            const clickUpTaskId = match[1];
            const clickUp = new node_shared_1.ClickUp(clickUpTaskId);
            const task = yield clickUp.getTask();
            const progress = clickUp.getTaskProgress();
            const updatedFull = full.replace(/\* \([A-Za-z0-9 %]+\)/, task.status.status === 'in progress' && progress
                ? `* (${(0, node_shared_1.titleCase)(task.status.status)} ${progress})`
                : `* (${(0, node_shared_1.titleCase)(task.status.status)})`);
            resultDp = resultDp.replace(full, updatedFull);
        }
        return resultDp;
    });
}
exports.updateTaskStatusInDp = updateTaskStatusInDp;
function getInfoFromArgv(clickUpOnly, allowEmptyInfo) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let clickUpTaskId = null;
        if (process.argv.length === 3) {
            const branchName = (0, child_process_1.execSync)('git branch --show-current', {
                encoding: 'utf-8',
            });
            const match = branchName.match(/CU-([a-z0-9]+)/);
            if (!match) {
                if (allowEmptyInfo) {
                    return {
                        gitLab: null,
                        gitLabProject: null,
                        mergeRequestIId: null,
                        mergeRequest: null,
                        clickUp: null,
                        clickUpTaskId: null,
                        clickUpTask: null,
                    };
                }
                throw Error('Cannot get task number from branch');
            }
            clickUpTaskId = match[1];
        }
        else {
            clickUpTaskId = process.argv[3];
        }
        if (clickUpTaskId) {
            const clickUp = new node_shared_1.ClickUp(clickUpTaskId);
            const clickUpTask = yield clickUp.getTask();
            if (clickUpOnly) {
                return { clickUpTask, clickUp, clickUpTaskId };
            }
            const { gitLabProject, mergeRequestIId } = yield clickUp.getGitLabProjectAndMergeRequestIId();
            const gitLab = new node_shared_1.GitLab(gitLabProject.id);
            const mergeRequest = yield gitLab.getMergeRequest(mergeRequestIId);
            return {
                gitLab,
                gitLabProject,
                mergeRequestIId,
                mergeRequest,
                clickUp,
                clickUpTaskId,
                clickUpTask,
            };
        }
        else {
            throw Error('No task id specified');
        }
    });
}
exports.getInfoFromArgv = getInfoFromArgv;
function checkWorkingTreeClean() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const result = yield promiseSpawn('git', ['status'], 'pipe');
        return (result.stdout.includes('Your branch is up to date with') &&
            result.stdout.includes('nothing to commit, working tree clean'));
    });
}
exports.checkWorkingTreeClean = checkWorkingTreeClean;
function openUrlsInTabGroup(urls, group) {
    (0, open_1.default)('http://localhost:8315/accel-shooter/?' +
        qs_1.default.stringify({
            urls: JSON.stringify(urls),
            group,
        }));
}
exports.openUrlsInTabGroup = openUrlsInTabGroup;
function getRepoName() {
    return (0, child_process_1.execSync)('basename -s .git `git config --get remote.origin.url`')
        .toString()
        .trim();
}
exports.getRepoName = getRepoName;
function getDayFromArgv(dft) {
    const today = new Date();
    return process.argv.length >= 4
        ? (0, date_fns_1.parse)(process.argv[3], node_shared_1.DateFormat.STANDARD, today)
        : dft
            ? new Date(dft.valueOf())
            : today;
}
exports.getDayFromArgv = getDayFromArgv;


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
const api_utils_1 = __webpack_require__("./libs/node-shared/src/lib/utils/api.utils.ts");
const case_utils_1 = __webpack_require__("./libs/node-shared/src/lib/utils/case.utils.ts");
const checklist_utils_1 = __webpack_require__("./libs/node-shared/src/lib/utils/checklist.utils.ts");
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
                    return task.status.status === 'in progress' && progress
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
                return ((events === null || events === void 0 ? void 0 : events.filter((event) => {
                    if (!event.attendees) {
                        return true;
                    }
                    const self = event.attendees.find((a) => a.self);
                    return !self || self.responseStatus !== 'declined';
                })) || []);
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
        'TodoFile',
        'TodoChangeNotificationFile',
        'WorkNoteFile',
        'MySummarizedTasksFile',
        'HolidayFile',
        'CommitScopeFile',
        'GoogleTokenFile',
        'GoogleCredentialsFile',
        'PunchInfoFile',
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

/***/ "./libs/node-shared/src/lib/models/clickup/task.models.ts":
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
exports.sleep = exports.formatDate = exports.DateFormat = exports.getTaskIdFromBranchName = exports.normalizeMarkdownChecklist = exports.normalizeClickUpChecklist = exports.getSyncChecklistActions = exports.titleCase = exports.ProjectCheckItem = exports.NormalizedChecklist = exports.IHoliday = exports.GitLabProject = exports.FullMergeRequest = exports.Change = exports.Job = exports.Task = exports.Space = exports.ChecklistItem = exports.getConfig = exports.CONFIG = exports.Google = exports.GitLab = exports.ClickUp = void 0;
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
var task_models_1 = __webpack_require__("./libs/node-shared/src/lib/models/clickup/task.models.ts");
Object.defineProperty(exports, "Task", ({ enumerable: true, get: function () { return task_models_1.Task; } }));
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

/***/ "@jcoreio/kexec":
/***/ ((module) => {

module.exports = require("@jcoreio/kexec");

/***/ }),

/***/ "cli-progress":
/***/ ((module) => {

module.exports = require("cli-progress");

/***/ }),

/***/ "clipboardy":
/***/ ((module) => {

module.exports = require("clipboardy");

/***/ }),

/***/ "cron":
/***/ ((module) => {

module.exports = require("cron");

/***/ }),

/***/ "date-fns":
/***/ ((module) => {

module.exports = require("date-fns");

/***/ }),

/***/ "fs":
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "fuzzy":
/***/ ((module) => {

module.exports = require("fuzzy");

/***/ }),

/***/ "googleapis":
/***/ ((module) => {

module.exports = require("googleapis");

/***/ }),

/***/ "inquirer":
/***/ ((module) => {

module.exports = require("inquirer");

/***/ }),

/***/ "inquirer-autocomplete-prompt":
/***/ ((module) => {

module.exports = require("inquirer-autocomplete-prompt");

/***/ }),

/***/ "js-yaml":
/***/ ((module) => {

module.exports = require("js-yaml");

/***/ }),

/***/ "mustache":
/***/ ((module) => {

module.exports = require("mustache");

/***/ }),

/***/ "node-fetch":
/***/ ((module) => {

module.exports = require("node-fetch");

/***/ }),

/***/ "open":
/***/ ((module) => {

module.exports = require("open");

/***/ }),

/***/ "progress-logs":
/***/ ((module) => {

module.exports = require("progress-logs");

/***/ }),

/***/ "puppeteer":
/***/ ((module) => {

module.exports = require("puppeteer");

/***/ }),

/***/ "qs":
/***/ ((module) => {

module.exports = require("qs");

/***/ }),

/***/ "ramda":
/***/ ((module) => {

module.exports = require("ramda");

/***/ }),

/***/ "rxjs":
/***/ ((module) => {

module.exports = require("rxjs");

/***/ }),

/***/ "rxjs/operators":
/***/ ((module) => {

module.exports = require("rxjs/operators");

/***/ }),

/***/ "single-instance-lock":
/***/ ((module) => {

module.exports = require("single-instance-lock");

/***/ }),

/***/ "tslib":
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),

/***/ "untildify":
/***/ ((module) => {

module.exports = require("untildify");

/***/ }),

/***/ "uuid":
/***/ ((module) => {

module.exports = require("uuid");

/***/ }),

/***/ "child_process":
/***/ ((module) => {

module.exports = require("child_process");

/***/ }),

/***/ "os":
/***/ ((module) => {

module.exports = require("os");

/***/ }),

/***/ "path":
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ "readline":
/***/ ((module) => {

module.exports = require("readline");

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

Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
const bi_weekly_progress_action_1 = __webpack_require__("./apps/cli/src/actions/bi-weekly-progress.action.ts");
const check_action_1 = __webpack_require__("./apps/cli/src/actions/check.action.ts");
const close_action_1 = __webpack_require__("./apps/cli/src/actions/close.action.ts");
const commit_action_1 = __webpack_require__("./apps/cli/src/actions/commit.action.ts");
const copy_action_1 = __webpack_require__("./apps/cli/src/actions/copy.action.ts");
const daily_progress_action_1 = __webpack_require__("./apps/cli/src/actions/daily-progress.action.ts");
const dump_my_tasks_action_1 = __webpack_require__("./apps/cli/src/actions/dump-my-tasks.action.ts");
const end_action_1 = __webpack_require__("./apps/cli/src/actions/end.action.ts");
const fetch_holiday_action_1 = __webpack_require__("./apps/cli/src/actions/fetch-holiday.action.ts");
const list_dc_action_1 = __webpack_require__("./apps/cli/src/actions/list-dc.action.ts");
const list_action_1 = __webpack_require__("./apps/cli/src/actions/list.action.ts");
const meeting_track_action_1 = __webpack_require__("./apps/cli/src/actions/meeting-track.action.ts");
const open_action_1 = __webpack_require__("./apps/cli/src/actions/open.action.ts");
const revert_end_action_1 = __webpack_require__("./apps/cli/src/actions/revert-end.action.ts");
const routine_action_1 = __webpack_require__("./apps/cli/src/actions/routine.action.ts");
const rtv_tasks_action_1 = __webpack_require__("./apps/cli/src/actions/rtv-tasks.action.ts");
const show_diff_action_1 = __webpack_require__("./apps/cli/src/actions/show-diff.action.ts");
const start_action_1 = __webpack_require__("./apps/cli/src/actions/start.action.ts");
const switch_action_1 = __webpack_require__("./apps/cli/src/actions/switch.action.ts");
const time_action_1 = __webpack_require__("./apps/cli/src/actions/time.action.ts");
const to_do_action_1 = __webpack_require__("./apps/cli/src/actions/to-do.action.ts");
const track_action_1 = __webpack_require__("./apps/cli/src/actions/track.action.ts");
const watch_pipeline_action_1 = __webpack_require__("./apps/cli/src/actions/watch-pipeline.action.ts");
const work_action_1 = __webpack_require__("./apps/cli/src/actions/work.action.ts");
const actions = {
    start: start_action_1.startAction,
    open: open_action_1.openAction,
    switch: switch_action_1.switchAction,
    dailyProgress: daily_progress_action_1.dailyProgressAction,
    track: track_action_1.trackAction,
    end: end_action_1.endAction,
    revertEnd: revert_end_action_1.revertEndAction,
    RTVTasks: rtv_tasks_action_1.RTVTasksAction,
    check: check_action_1.checkAction,
    dumpMyTasks: dump_my_tasks_action_1.dumpMyTasksAction,
    list: list_action_1.listAction,
    toDo: to_do_action_1.toDoAction,
    copy: copy_action_1.copyAction,
    showDiff: show_diff_action_1.showDiffAction,
    time: time_action_1.timeAction,
    fetchHoliday: fetch_holiday_action_1.fetchHolidayAction,
    watchPipeline: watch_pipeline_action_1.watchPipelineAction,
    commit: commit_action_1.commitAction,
    close: close_action_1.closeAction,
    work: work_action_1.workAction,
    routine: routine_action_1.routineAction,
    biWeeklyProgress: bi_weekly_progress_action_1.biWeeklyProgressAction,
    listDC: list_dc_action_1.listDCAction,
    meetingTrack: meeting_track_action_1.meetingTrackAction,
};
(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const action = process.argv[2];
    if (actions[action]) {
        yield actions[action]();
    }
    else {
        throw Error(`Action ${action} is not supported.`);
    }
}))();

})();

var __webpack_export_target__ = exports;
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;
//# sourceMappingURL=main.js.map