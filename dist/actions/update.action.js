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
exports.updateAction = void 0;
const date_fns_1 = require("date-fns");
const daily_progress_class_1 = require("../classes/daily-progress.class");
const utils_1 = require("../utils");
function updateAction() {
    return __awaiter(this, void 0, void 0, function* () {
        const day = process.argv.length >= 4
            ? process.argv[3]
            : date_fns_1.format(new Date(), "yyyy/MM/dd");
        const dp = new daily_progress_class_1.DailyProgress();
        const record = dp.getRecordByDay(day);
        if (record) {
            const newDpRecord = yield utils_1.updateTaskStatusInDp(record);
            dp.writeRecordByDay(day, newDpRecord);
            console.log(newDpRecord);
            console.log("Updated!");
        }
    });
}
exports.updateAction = updateAction;
