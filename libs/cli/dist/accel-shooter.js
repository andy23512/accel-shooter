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
const check_action_1 = require("./actions/check.action");
const comment_action_1 = require("./actions/comment.action");
const cross_checklist_action_1 = require("./actions/cross-checklist.action");
const end_action_1 = require("./actions/end.action");
const list_action_1 = require("./actions/list.action");
const my_tasks_action_1 = require("./actions/my-tasks.action");
const open_action_1 = require("./actions/open.action");
const revert_end_action_1 = require("./actions/revert-end.action");
const rtv_tasks_action_1 = require("./actions/rtv-tasks.action");
const start_action_1 = require("./actions/start.action");
const sync_action_1 = require("./actions/sync.action");
const time_action_1 = require("./actions/time.action");
const to_do_action_1 = require("./actions/to-do.action");
const track_action_1 = require("./actions/track.action");
const update_action_1 = require("./actions/update.action");
const actions = {
    start: start_action_1.startAction,
    open: open_action_1.openAction,
    sync: sync_action_1.syncAction,
    update: update_action_1.updateAction,
    track: track_action_1.trackAction,
    end: end_action_1.endAction,
    revertEnd: revert_end_action_1.revertEndAction,
    crossChecklist: cross_checklist_action_1.crossChecklistAction,
    RTVTasks: rtv_tasks_action_1.RTVTasksAction,
    check: check_action_1.checkAction,
    comment: comment_action_1.commentAction,
    myTasks: my_tasks_action_1.myTasksAction,
    list: list_action_1.listAction,
    toDo: to_do_action_1.toDoAction,
    time: time_action_1.timeAction,
};
(() => __awaiter(void 0, void 0, void 0, function* () {
    const action = process.argv[2];
    if (actions[action]) {
        yield actions[action]();
    }
    else {
        throw Error(`Action ${action} is not supported.`);
    }
}))();
