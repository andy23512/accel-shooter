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
const node_fetch_1 = __importDefault(require("node-fetch"));
const config_1 = require("./config");
function checkStatus(res) {
    if (res.ok) {
        return res;
    }
    else {
        throw Error(res.statusText);
    }
}
function callApiFactory(site) {
    let apiUrl = '';
    let headers = {};
    switch (site) {
        case 'GitLab':
            apiUrl = 'https://gitlab.com/api/v4';
            headers = { 'Private-Token': config_1.CONFIG.GitLabToken };
            break;
        case 'ClickUp':
            apiUrl = 'https://api.clickup.com/api/v2';
            headers = { Authorization: config_1.CONFIG.ClickUpToken };
            break;
        default:
            throw Error(`Site {site} is not supported.`);
    }
    return (method, url, body) => __awaiter(this, void 0, void 0, function* () {
        const params = new URLSearchParams();
        if (body) {
            Object.entries(body).forEach(([key, value]) => {
                params.set(key, value);
            });
        }
        return node_fetch_1.default(apiUrl + url, method === 'get'
            ? {
                method,
                headers,
            }
            : { method, headers, body: params })
            .then(checkStatus)
            .then((res) => res.json());
    });
}
exports.callApiFactory = callApiFactory;
function dashify(input) {
    let temp = input
        .replace(/[^A-Za-z0-9]/g, '-')
        .replace(/-{2,}/g, '-')
        .replace(/-+$/, '')
        .toLowerCase();
    if (temp.length >= 100) {
        temp = temp.substring(0, 100);
        return temp.substring(0, temp.lastIndexOf('-'));
    }
    return temp;
}
exports.dashify = dashify;
function normalizeGitLabIssueChecklist(checklistText) {
    return checklistText.split('\n').map((line, index) => ({
        name: line
            .replace(/- \[[x ]\] /g, '')
            .replace(/^ +/, (space) => space.replace(/ /g, '-')),
        checked: /- \[x\]/.test(line),
        order: index,
    }));
}
exports.normalizeGitLabIssueChecklist = normalizeGitLabIssueChecklist;
function normalizeClickUpChecklist(checklist) {
    return checklist
        .sort((a, b) => a.orderindex - b.orderindex)
        .map((item, index) => ({
        name: item.name,
        checked: item.resolved,
        order: index,
        id: item.id,
    }));
}
exports.normalizeClickUpChecklist = normalizeClickUpChecklist;
