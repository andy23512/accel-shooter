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
exports.callApiFactory = void 0;
const qs_1 = __importDefault(require("qs"));
const config_1 = require("./config");
const sleep_utils_1 = require("./sleep.utils");
const RETRY_SETTING = {
    retry: 5,
    pause: 12 * 1000,
};
function fetchRetry(url, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        let retry = (opts && opts.retry) || 3;
        while (retry > 0) {
            try {
                return yield fetch(url, opts);
            }
            catch (e) {
                if (opts === null || opts === void 0 ? void 0 : opts.callback) {
                    opts.callback(retry);
                }
                retry = retry - 1;
                if (retry == 0) {
                    throw e;
                }
                if (opts === null || opts === void 0 ? void 0 : opts.pause) {
                    yield sleep_utils_1.sleep(opts.pause);
                }
            }
        }
    });
}
function checkStatus(res) {
    if (res) {
        if (res.ok) {
            return res;
        }
        else {
            throw Error(res.statusText);
        }
    }
    else {
        throw Error("Response is undefined.");
    }
}
function callApiFactory(site) {
    let apiUrl = "";
    let headers = {};
    switch (site) {
        case "GitLab":
            apiUrl = "https://gitlab.com/api/v4";
            headers = { "Private-Token": config_1.CONFIG.GitLabToken };
            break;
        case "ClickUp":
            apiUrl = "https://api.clickup.com/api/v2";
            headers = { Authorization: config_1.CONFIG.ClickUpToken };
            break;
        default:
            throw Error(`Site {site} is not supported.`);
    }
    return (method, url, queryParams, body) => __awaiter(this, void 0, void 0, function* () {
        let params;
        if (typeof body === "object") {
            params = new URLSearchParams();
            Object.entries(body).forEach(([key, value]) => {
                params.set(key, value);
            });
        }
        if (typeof body === "string") {
            params = body;
        }
        if (queryParams) {
            url += "?" + qs_1.default.stringify(queryParams, { arrayFormat: "brackets" });
        }
        return fetchRetry(apiUrl + url, method === "get"
            ? Object.assign({ method,
                headers }, RETRY_SETTING) : Object.assign({ method, headers, body: params }, RETRY_SETTING))
            .then(checkStatus)
            .then((res) => res.json())
            .catch((error) => {
            console.log(apiUrl + url);
            throw error;
        });
    });
}
exports.callApiFactory = callApiFactory;
