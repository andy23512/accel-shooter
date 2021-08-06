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
exports.checkItemsMap = void 0;
const check_item_class_1 = require("../classes/check-item.class");
const utils_1 = require("../utils");
const checkNonPushedChanges = new check_item_class_1.CheckItem("Global", "Check Non-Pushed Changes", true, () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield utils_1.promiseSpawn("git", ["status"], "pipe");
    result.code =
        result.stdout.includes("Your branch is up to date with") &&
            result.stdout.includes("nothing to commit, working tree clean")
            ? 0
            : 1;
    return result;
}));
const checkConflict = new check_item_class_1.CheckItem("Global", "Check Conflict", true, ({ mergeRequest, gitLab }) => __awaiter(void 0, void 0, void 0, function* () {
    const fullMergeRequest = yield gitLab.getMergeRequest(mergeRequest.iid);
    const isConflict = fullMergeRequest.has_conflicts;
    return { code: isConflict ? 1 : 0 };
}));
const checkFrontendConsoleLog = new check_item_class_1.CheckItem("Frontend", "Check console.log", true, ({ frontendChanges }) => __awaiter(void 0, void 0, void 0, function* () {
    return {
        code: frontendChanges.some((c) => c.new_path.endsWith(".ts") &&
            c.diff
                .split("\n")
                .some((line) => !line.startsWith("-") && line.includes("console.log")))
            ? 1
            : 0,
    };
}));
const checkFrontendLongImport = new check_item_class_1.CheckItem("Frontend", "Check long import", true, ({ frontendChanges }) => __awaiter(void 0, void 0, void 0, function* () {
    return {
        code: frontendChanges.some((c) => c.new_path.endsWith(".ts") &&
            c.diff
                .split("\n")
                .some((line) => !line.startsWith("-") && line.includes("../../lib/")))
            ? 1
            : 0,
    };
}));
const checkBackendPrint = new check_item_class_1.CheckItem("Backend", "Check Print", true, ({ backendChanges }) => __awaiter(void 0, void 0, void 0, function* () {
    return {
        code: backendChanges.some((c) => c.new_path.endsWith(".py") &&
            c.diff
                .split("\n")
                .some((line) => !line.startsWith("-") && line.includes("print(")))
            ? 1
            : 0,
    };
}));
const checkBackendMigrationConflict = new check_item_class_1.CheckItem("Backend", "Check Migration Conflict", true, ({ mergeRequest, backendChanges, gitLab }) => __awaiter(void 0, void 0, void 0, function* () {
    if (!backendChanges.some((c) => c.new_path.includes("migrations"))) {
        return { code: 0 };
    }
    const branchName = mergeRequest.source_branch;
    const defaultBranch = yield gitLab.getDefaultBranchName();
    const compare = yield gitLab.getCompare(defaultBranch, branchName);
    const migrationDiffs = compare.diffs.filter((d) => (d.new_file || d.deleted_file) && d.new_path.includes("migration"));
    const plusFiles = new Set(migrationDiffs
        .filter((d) => d.new_file)
        .map((d) => {
        const match = d.new_path.match(/backend\/(\w+)\/migrations\/(\d+)/);
        return match ? match[1] + "_" + match[2] : null;
    })
        .filter(Boolean));
    const minusFiles = new Set(migrationDiffs
        .filter((d) => d.deleted_file)
        .map((d) => {
        const match = d.new_path.match(/backend\/(\w+)\/migrations\/(\d+)/);
        return match ? match[1] + "_" + match[2] : null;
    })
        .filter(Boolean));
    return {
        code: [...plusFiles].filter((f) => minusFiles.has(f)).length > 0 ? 1 : 0,
    };
}));
const fullProjectCheckItems = [
    checkNonPushedChanges,
    checkConflict,
    checkFrontendConsoleLog,
    checkFrontendLongImport,
    checkBackendPrint,
    checkBackendMigrationConflict,
];
const frontendProjectCheckItems = [
    checkNonPushedChanges,
    checkConflict,
    checkFrontendConsoleLog,
    checkFrontendLongImport,
];
const otherProjectCheckItems = [
    checkNonPushedChanges,
    checkConflict,
];
exports.checkItemsMap = {
    full: fullProjectCheckItems,
    frontend: frontendProjectCheckItems,
    other: otherProjectCheckItems,
};
