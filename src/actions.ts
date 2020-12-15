import open from "open";
import readline from "readline";
import { ClickUp } from "./clickup";
import { GitLab } from "./gitlab";
import { NormalizedChecklist } from "./models/models";
import {
  normalizeClickUpChecklist,
  normalizeGitLabIssueChecklist,
} from "./utils";

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

export async function syncChecklist(
  gitLabProjectId: string,
  issueNumber: string,
  openIssuePage?: boolean
) {
  const gitLab = new GitLab(gitLabProjectId);
  const issue = await gitLab.getIssue(issueNumber);
  if (openIssuePage) {
    open(issue.web_url);
  }
  const issueDescription: string = issue.description;
  const result = issueDescription.match(/https:\/\/app.clickup.com\/t\/(\w+)/);
  if (result) {
    const clickUpTaskId = result[1];
    const gitLabChecklistText = issueDescription
      .replace(/https:\/\/app.clickup.com\/t\/\w+/g, "")
      .trim();
    const gitLabNormalizedChecklist = normalizeGitLabIssueChecklist(
      gitLabChecklistText
    );
    const clickUp = new ClickUp(clickUpTaskId);
    const clickUpTasks = await clickUp.getTask();
    const clickUpChecklistTitle = `GitLab synced checklist [${gitLabProjectId.replace(
      "%2F",
      "/"
    )}]`;
    let clickUpChecklist = clickUpTasks.checklists.find(
      (c: any) => c.name === clickUpChecklistTitle
    );
    if (!clickUpChecklist) {
      clickUpChecklist = (await clickUp.createChecklist(clickUpChecklistTitle))
        .checklist;
    }
    const clickUpNormalizedChecklist = normalizeClickUpChecklist(
      clickUpChecklist.items
    );
    const actions = getSyncChecklistActions(
      clickUpNormalizedChecklist,
      gitLabNormalizedChecklist
    );
    if (
      actions.update.length + actions.create.length + actions.delete.length ===
      0
    ) {
      return;
    }
    for (const checklistItem of actions.update) {
      await clickUp.updateChecklistItem(
        clickUpChecklist.id,
        checklistItem.id as string,
        checklistItem.name,
        checklistItem.checked,
        checklistItem.order
      );
    }
    for (const checklistItem of actions.create) {
      await clickUp.createChecklistItem(
        clickUpChecklist.id,
        checklistItem.name,
        checklistItem.checked,
        checklistItem.order
      );
    }
    for (const checklistItem of actions.delete) {
      await clickUp.deleteChecklistItem(
        clickUpChecklist.id,
        checklistItem.id as string
      );
    }
    const status = Object.entries(actions)
      .map(([action, items]) => {
        const s = items.length.toString();
        const n = items.length === 1 ? "item" : "items";
        return `${s} ${n} ${action}d`;
      })
      .join(", ");
    const fullCompleteMessage = gitLabNormalizedChecklist.every(
      (item) => item.checked
    )
      ? "(Completed)"
      : "";
    console.log(
      `[${gitLabProjectId.replace(
        "%2F",
        "/"
      )} #${issueNumber}] ${new Date().toLocaleString()} ${status} ${fullCompleteMessage}`
    );
  }
}

export function configReadline() {
  readline.emitKeypressEvents(process.stdin);
}

export function setUpSyncHotkey(gitLabProjectId: string, issueNumber: string) {
  process.stdin.setRawMode(true);
  process.stdin.on("keypress", (_, key) => {
    if (key.ctrl && key.name === "c") {
      process.exit();
    } else if (!key.ctrl && !key.meta && !key.shift && key.name === "s") {
      console.log(`You pressed the sync key`);
      syncChecklist(gitLabProjectId, issueNumber);
    }
  });
}
