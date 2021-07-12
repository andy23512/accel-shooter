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
exports.toDoAction = void 0;
const clipboardy_1 = __importDefault(require("clipboardy"));
const fs_1 = require("fs");
const inquirer_1 = __importDefault(require("inquirer"));
const mustache_1 = require("mustache");
const untildify_1 = __importDefault(require("untildify"));
const config_1 = require("../config");
function toDoAction() {
    return __awaiter(this, void 0, void 0, function* () {
        const answers = yield inquirer_1.default.prompt([
            {
                name: "gitLabProject",
                message: "Choose GitLab Project",
                type: "list",
                choices: config_1.CONFIG.GitLabProjects.map((p) => ({
                    name: `${p.name} (${p.repo})`,
                    value: p,
                })),
            },
            {
                name: "todoConfig",
                message: "Choose Preset To-do Config",
                type: "checkbox",
                choices: config_1.CONFIG.ToDoConfigChoices,
            },
        ]);
        const todoConfigMap = {};
        answers.todoConfig.forEach((c) => {
            todoConfigMap[c] = true;
        });
        todoConfigMap[answers.gitLabProject.id] = true;
        const template = fs_1.readFileSync(untildify_1.default(config_1.CONFIG.ToDoTemplate), {
            encoding: "utf-8",
        });
        const endingTodo = mustache_1.render(template, todoConfigMap);
        clipboardy_1.default.writeSync(endingTodo);
        console.log(endingTodo);
        console.log("Copied!");
    });
}
exports.toDoAction = toDoAction;
