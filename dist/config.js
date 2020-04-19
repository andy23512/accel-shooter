"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
function getConfigPath() {
    return path_1.resolve(__dirname, '../.config.json');
}
exports.getConfigPath = getConfigPath;
function getConfig() {
    const configPath = getConfigPath();
    return fs_1.existsSync(configPath)
        ? JSON.parse(fs_1.readFileSync(configPath, { encoding: 'utf-8' }))
        : {};
}
exports.getConfig = getConfig;
exports.CONFIG = getConfig();
