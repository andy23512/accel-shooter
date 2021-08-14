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
exports.crossChecklistAction = void 0;
const clipboardy_1 = __importDefault(require("clipboardy"));
const inquirer_1 = __importDefault(require("inquirer"));
const config_1 = require("../config");
function crossChecklistAction() {
    return __awaiter(this, void 0, void 0, function* () {
        const answers = yield inquirer_1.default.prompt([
            {
                name: "initialSpaces",
                message: "Enter prefix spaces",
                type: "input",
            },
            {
                name: "firstLevel",
                message: "Enter first level items",
                type: "editor",
            },
            {
                name: "secondLevel",
                message: "Enter second level items",
                type: "editor",
                default: config_1.CONFIG.CrossChecklistDefaultSecondLevel.join("\n"),
            },
        ]);
        const firstLevelItems = answers.firstLevel
            .split("\n")
            .filter(Boolean);
        const secondLevelItems = answers.secondLevel
            .split("\n")
            .filter(Boolean);
        const result = firstLevelItems
            .map((e) => answers.initialSpaces +
            "  - [ ] " +
            e +
            "\n" +
            secondLevelItems
                .map((f) => `${answers.initialSpaces}    - [ ] ${f}`)
                .join("\n"))
            .join("\n");
        clipboardy_1.default.writeSync(result);
        console.log(result);
        console.log("Copied!");
    });
}
exports.crossChecklistAction = crossChecklistAction;
