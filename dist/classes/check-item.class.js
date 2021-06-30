"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckItem = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
class CheckItem {
    constructor(group, name, defaultChecked, run, stdoutReducer) {
        this.group = group;
        this.name = name;
        this.defaultChecked = defaultChecked;
        this.run = run;
        this.stdoutReducer = stdoutReducer;
        this.displayName = `[${this.group}] ${this.name}`;
    }
    getObs(context) {
        return rxjs_1.concat(rxjs_1.of({
            group: this.group,
            name: this.name,
            code: -1,
            stdout: "",
            stderr: "",
        }), rxjs_1.defer(() => this.run(context)).pipe(operators_1.map((d) => {
            const result = d;
            result.group = this.group;
            result.name = this.name;
            if (this.stdoutReducer && result.stdout) {
                result.stdout = this.stdoutReducer(result.stdout);
            }
            return result;
        })));
    }
}
exports.CheckItem = CheckItem;
