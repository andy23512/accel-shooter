import clipboardy from "clipboardy";
import open from "open";
import readline from "readline";
import { ClickUp } from "./classes/clickup.class";
import { CustomEmojiProgress } from "./classes/emoji-progress.class";
import { GitLab } from "./classes/gitlab.class";
import { NormalizedChecklist } from "./models/models";
import {
  getClickUpTaskIdFromGitLabIssue,
  getGitLabProjectConfigById,
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
  ep: CustomEmojiProgress,
  openPage?: boolean
) {
  const gitLab = new GitLab(gitLabProjectId);
  const issue = await gitLab.getIssue(issueNumber);
  if (openPage) {
    open(issue.web_url);
    const result = issue.description.match(/https:\/\/app.clickup.com\/t\/\w+/);
    if (result) {
      open(result[0]);
    }
  }
  const clickUpTaskId = getClickUpTaskIdFromGitLabIssue(issue);
  if (clickUpTaskId) {
    const gitLabChecklistText = issue.description
      .replace(/https:\/\/app.clickup.com\/t\/\w+/g, "")
      .trim();
    const gitLabNormalizedChecklist =
      normalizeGitLabIssueChecklist(gitLabChecklistText);
    const clickUp = new ClickUp(clickUpTaskId);
    const clickUpTask = await clickUp.getTask();
    const clickUpChecklistTitle = `GitLab synced checklist [${gitLabProjectId.replace(
      "%2F",
      "/"
    )}]`;
    let clickUpChecklist = clickUpTask.checklists.find(
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
    const checkedCount = gitLabNormalizedChecklist.filter(
      (item) => item.checked
    ).length;
    const totalCount = gitLabNormalizedChecklist.length;
    ep.setValueAndEndValue(checkedCount, totalCount);
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
  }
}

export function configReadline() {
  readline.emitKeypressEvents(process.stdin);
}

export function setUpSyncHotkey(
  gitLabProjectId: string,
  issueNumber: string,
  ep: CustomEmojiProgress
) {
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on("keypress", async (_, key) => {
    if (key.ctrl && key.name === "c") {
      process.exit();
    } else if (!key.ctrl && !key.meta && !key.shift && key.name === "s") {
      console.log(`You pressed the sync key`);
      syncChecklist(gitLabProjectId, issueNumber, ep);
    } else if (!key.ctrl && !key.meta && !key.shift && key.name === "e") {
      console.log(`You pressed the end key`);
      await syncChecklist(gitLabProjectId, issueNumber, ep);
      const projectName = getGitLabProjectConfigById(gitLabProjectId)?.name;
      const syncCommand = `acst end ${projectName} ${issueNumber}`;
      clipboardy.writeSync(syncCommand);
      console.log(`Sync command: "${syncCommand}" Copied!`);
      process.exit();
    }
  });
}
