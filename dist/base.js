"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
class BaseFileRef {
    readFile() {
        return fs_1.readFileSync(this.path, { encoding: 'utf-8' });
    }
    writeFile(content) {
        fs_1.writeFileSync(this.path, content);
    }
}
exports.BaseFileRef = BaseFileRef;
