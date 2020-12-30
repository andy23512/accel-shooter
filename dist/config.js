"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const untildify_1 = __importDefault(require("untildify"));
function getConfigPath() {
    if (process.env.ACCEL_SHOOTER_CONFIG_FILE) {
        return untildify_1.default(process.env.ACCEL_SHOOTER_CONFIG_FILE);
    }
    else {
        throw Error("environment variable ACCEL_SHOOTER_CONFIG_FILE not found");
    }
}
exports.getConfigPath = getConfigPath;
function getConfig() {
    const configPath = getConfigPath();
    return fs_1.existsSync(configPath)
        ? JSON.parse(fs_1.readFileSync(configPath, { encoding: "utf-8" }))
        : {};
}
exports.getConfig = getConfig;
exports.CONFIG = getConfig();
