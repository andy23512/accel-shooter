"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomEmojiProgress = void 0;
const emoji_progress_1 = __importDefault(require("emoji-progress"));
class CustomEmojiProgress extends emoji_progress_1.default {
    constructor(start, end) {
        super({
            start,
            end,
            unit: "🥕",
            fillerRight: "🥕",
            fillerLeft: " ",
            indicator: "🐰",
            autostart: true,
        });
    }
    setValueAndEndValue(value, endValue) {
        this.endValue = endValue;
        this.value = value;
        if (this.value >= this.endValue) {
            this.value = this.endValue;
            this.complete();
        }
    }
}
exports.CustomEmojiProgress = CustomEmojiProgress;
