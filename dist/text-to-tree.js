"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TreeNode {
    constructor(title, _level) {
        this.title = title;
        this._level = _level;
        this.children = [];
        this._parent = null;
        this.checked = false;
        if (/- \[x\]/.test(title)) {
            this.checked = true;
        }
        this.title = this.title.replace(/- \[[x ]\] /g, '');
    }
    get level() {
        return typeof this._level === 'undefined' ? -1 : this._level;
    }
    get parent() {
        return this._parent;
    }
    set parent(parent) {
        this._parent = parent;
    }
    appendChildren(c) {
        this.children.push(c);
        c.parent = this;
        return this;
    }
}
function appendRec(prev, curr) {
    if (typeof curr == 'string') {
        //in the recursive call it's a object
        const path = curr.split('  ');
        curr = new TreeNode(path.pop(), path.length);
    }
    if (prev) {
        if (curr.level > prev.level) {
            //curr is prev's child
            prev.appendChildren(curr);
        }
        else if (curr.level < prev.level) {
            appendRec(prev.parent, curr); //recursive call to find the right parent level
        }
        else if (prev.parent) {
            //curr is prev's sibling
            prev.parent.appendChildren(curr);
        }
    }
    return curr;
}
function textToTree(text) {
    const root = new TreeNode('root');
    text.toString().split('\n').reduce(appendRec, root);
    return root.children;
}
exports.textToTree = textToTree;
