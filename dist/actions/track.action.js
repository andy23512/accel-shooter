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
exports.trackAction = void 0;
const instance_locker_1 = __importDefault(require("instance-locker"));
const tracker_class_1 = require("../classes/tracker.class");
const locker = instance_locker_1.default("accel-shooter track");
function trackAction() {
    return __awaiter(this, void 0, void 0, function* () {
        const success = yield locker.Lock();
        if (success) {
            const tracker = new tracker_class_1.Tracker();
            tracker.startSync();
        }
        else {
            console.log("Lock occupied!");
        }
    });
}
exports.trackAction = trackAction;
