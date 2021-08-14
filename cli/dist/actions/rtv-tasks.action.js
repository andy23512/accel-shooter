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
exports.RTVTasksAction = void 0;
const clickup_class_1 = require("../classes/clickup.class");
const config_1 = require("../config");
function RTVTasksAction() {
    return __awaiter(this, void 0, void 0, function* () {
        const user = (yield clickup_class_1.ClickUp.getCurrentUser()).user;
        const team = (yield clickup_class_1.ClickUp.getTeams()).teams.find((t) => t.name === config_1.CONFIG.ClickUpTeam);
        if (!team) {
            console.log("Team does not exist.");
            return;
        }
        const tasks = (yield clickup_class_1.ClickUp.getRTVTasks(team.id, user.id)).tasks;
        console.log(tasks.map((t) => `- ${t.name} (${t.url})`).join("\n"));
    });
}
exports.RTVTasksAction = RTVTasksAction;
