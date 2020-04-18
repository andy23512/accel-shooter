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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path_1 = require("path");
(() => __awaiter(void 0, void 0, void 0, function* () {
    const action = process.argv[2];
    switch (action) {
        case 'config':
            const configFile = process.argv[3];
            setConfigFile(configFile);
            break;
        case 'start':
        default:
            throw Error(`Action {action} is not supported`);
    }
}))();
function setConfigFile(configFile) {
    const src = path_1.resolve(configFile);
    const dest = path_1.resolve(__dirname, '../.config.json');
    fs.copyFileSync(src, dest);
}
