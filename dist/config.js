"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG = exports.getConfig = exports.getConfigPath = void 0;
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
    if (!fs_1.existsSync) {
        throw Error("config file does not exist");
    }
    const config = JSON.parse(fs_1.readFileSync(configPath, { encoding: "utf-8" }));
    config.GitLabProjects = config.GitLabProjects.map((p) => (Object.assign(Object.assign({}, p), { path: untildify_1.default(p.path) })));
    return config;
}
exports.getConfig = getConfig;
exports.CONFIG = getConfig();
