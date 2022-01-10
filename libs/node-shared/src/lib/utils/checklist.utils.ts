import { ChecklistItem } from "../models/clickup.models";
import { NormalizedChecklist } from "../models/models";

export function normalizeClickUpChecklist(
  checklist: ChecklistItem[]
): NormalizedChecklist {
  return checklist
    .sort((a, b) => a.orderindex - b.orderindex)
    .map((item, index) => ({
      name: item.name,
      checked: item.resolved,
      order: index,
      id: item.id,
    }));
}

export function normalizeMarkdownChecklist(
  markdown: string
): NormalizedChecklist {
  return markdown
    .split("\n")
    .filter(
      (line) => line && (line.includes("- [ ]") || line.includes("- [x]"))
    )
    .map((line, index) => ({
      name: line
        .replace(/- \[[x ]\] /g, "")
        .replace(/^ +/, (space) => space.replace(/ /g, "-")),
      checked: /- \[x\]/.test(line),
      order: index,
    }));
}

export function getSyncChecklistActions(
  oldClickUpChecklist: NormalizedChecklist,
  newGitLabChecklist: NormalizedChecklist
) {
  const actions: {
    update: NormalizedChecklist;
    create: NormalizedChecklist;
    delete: NormalizedChecklist;
  } = {
    update: [],
    create: [],
    delete: [],
  };
  const oldLength = oldClickUpChecklist.length;
  const newLength = newGitLabChecklist.length;
  if (newLength < oldLength) {
    actions.delete = oldClickUpChecklist.slice(newLength);
  } else if (newLength > oldLength) {
    actions.create = newGitLabChecklist.slice(oldLength);
  }
  const minLength = Math.min(oldLength, newLength);
  for (let i = 0; i < minLength; i++) {
    const oldItem = oldClickUpChecklist[i];
    const newItem = newGitLabChecklist[i];
    if (oldItem.checked !== newItem.checked || oldItem.name !== newItem.name) {
      actions.update.push({
        id: oldItem.id,
        ...newItem,
      });
    }
  }
  return actions;
}
