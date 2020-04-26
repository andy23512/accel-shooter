export class TreeNode {
  public children: TreeNode[] = [];
  private _parent: TreeNode | null = null;
  public checked = false;
  constructor(public name: string, private _level?: number) {
    if (/- \[x\]/.test(name)) {
      this.checked = true;
    }
    this.name = this.name.replace(/- \[[x ]\] /g, '');
  }
  get level(): number {
    return typeof this._level === 'undefined' ? -1 : this._level;
  }
  get parent() {
    return this._parent;
  }
  set parent(parent: TreeNode | null) {
    this._parent = parent;
  }
  public appendChildren(c: TreeNode) {
    this.children.push(c);
    c.parent = this;
    return this;
  }
}

function appendRec(prev: TreeNode | null, curr: string | TreeNode) {
  if (typeof curr == 'string') {
    //in the recursive call it's a object
    const path = curr.split('  ');
    curr = new TreeNode(path.pop() as string, path.length);
  }
  if (prev) {
    if (curr.level > prev.level) {
      //curr is prev's child
      prev.appendChildren(curr);
    } else if (curr.level < prev.level) {
      appendRec(prev.parent, curr); //recursive call to find the right parent level
    } else if (prev.parent) {
      //curr is prev's sibling
      prev.parent.appendChildren(curr);
    }
  }
  return curr;
}

export function textToTree(text: string) {
  const root = new TreeNode('root');
  text.toString().split('\n').reduce(appendRec, root);
  return root.children;
}
