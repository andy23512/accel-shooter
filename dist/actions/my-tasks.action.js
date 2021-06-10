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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.myTasksAction = void 0;
const chalk_1 = __importDefault(require("chalk"));
const console_1 = require("console");
const moment_1 = __importDefault(require("moment"));
const clickup_class_1 = require("../classes/clickup.class");
const config_1 = require("../config");
function myTasksAction() {
    return __awaiter(this, void 0, void 0, function* () {
        const user = (yield clickup_class_1.ClickUp.getCurrentUser()).user;
        const team = (yield clickup_class_1.ClickUp.getTeams()).teams.find((t) => t.name === config_1.CONFIG.ClickUpTeam);
        if (!team) {
            console.log("Team does not exist.");
            return;
        }
        const tasks = (yield clickup_class_1.ClickUp.getMyTasks(team.id, user.id)).tasks;
        const summarizedTasks = [];
        for (const task of tasks) {
            const taskPath = [task];
            let t = task;
            while (t.parent) {
                t = yield new clickup_class_1.ClickUp(task.parent).getTask();
                taskPath.push(t);
            }
            const simpleTaskPath = taskPath.map((t) => ({
                name: t.name,
                id: t.id,
                priority: t.priority,
                due_date: t.due_date,
            }));
            const reducedTask = simpleTaskPath.reduce((a, c) => ({
                name: c.name + " - " + a.name,
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
                priority: reducedTask.priority,
                due_date: reducedTask.due_date,
                original_priority: task.priority,
                original_due_date: task.due_date,
            });
        }
        const compare = (a, b) => {
            if (a === b) {
                return 0;
            }
            else if (a === null || typeof a === "undefined") {
                return 1;
            }
            else if (b === null || typeof b === "undefined") {
                return -1;
            }
            return parseInt(a) - parseInt(b);
        };
        const colorPriority = (priority) => {
            switch (priority) {
                case "urgent":
                    return chalk_1.default.redBright(priority);
                case "high":
                    return chalk_1.default.yellowBright(priority);
                case "normal":
                    return chalk_1.default.cyanBright(priority);
                default:
                    return chalk_1.default.white(priority);
            }
        };
        const topDueDateTasks = summarizedTasks
            .filter((t) => t.due_date)
            .sort((a, b) => {
            var _a, _b;
            return (compare(a.due_date, b.due_date) ||
                compare((_a = a.priority) === null || _a === void 0 ? void 0 : _a.orderindex, (_b = b.priority) === null || _b === void 0 ? void 0 : _b.orderindex));
        });
        console.log("Sort by Due Date:");
        console.log(console_1.table(topDueDateTasks.map((t) => {
            var _a;
            return [
                t.name,
                colorPriority((_a = t.priority) === null || _a === void 0 ? void 0 : _a.priority),
                moment_1.default(+t.due_date).format("YYYY-MM-DD"),
            ];
        })));
        const topPriorityTasks = summarizedTasks
            .filter((t) => t.priority)
            .sort((a, b) => {
            var _a, _b;
            return (compare((_a = a.priority) === null || _a === void 0 ? void 0 : _a.orderindex, (_b = b.priority) === null || _b === void 0 ? void 0 : _b.orderindex) ||
                compare(a.due_date, b.due_date));
        });
        console.log("Sort by Priority:");
        console.log(console_1.table(topPriorityTasks.map((t) => {
            var _a;
            return [
                t.name,
                colorPriority((_a = t.priority) === null || _a === void 0 ? void 0 : _a.priority),
                t.due_date ? moment_1.default(+t.due_date).format("YYYY-MM-DD") : "",
            ];
        })));
    });
}
exports.myTasksAction = myTasksAction;
