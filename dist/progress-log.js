"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const progress_logs_1 = __importDefault(require("progress-logs"));
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
}
exports.CustomProgressLog = CustomProgressLog;
