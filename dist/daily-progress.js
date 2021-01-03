"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const untildify_1 = __importDefault(require("untildify"));
const base_1 = require("./base");
const config_1 = require("./config");
class DailyProgress extends base_1.BaseFileRef {
    get path() {
        return untildify_1.default(config_1.CONFIG.DailyProgressFile);
    }
    addProgressToBuffer(dailyProgressString) {
        const content = this.readFile();
        const updatedDpContent = content.replace('## Buffer', `## Buffer\n    ${dailyProgressString}`);
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
