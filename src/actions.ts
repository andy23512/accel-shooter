import { NormalizedChecklist } from './models/models';
import { GitLab } from './gitlab';
import {
  normalizeGitLabIssueChecklist,
  normalizeClickUpChecklist,
} from './utils';
import { ClickUp } from './clickup';

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
  issueNumber: string
) {
  const gitLab = new GitLab(gitLabProjectId);
  const issue = await gitLab.getIssue(issueNumber);
  const issueDescription: string = issue.description;
  const result = issueDescription.match(/https:\/\/app.clickup.com\/t\/(\w+)/);
  if (result) {
    const clickUpTaskId = result[1];
    const gitLabChecklistText = issueDescription
      .replace(/https:\/\/app.clickup.com\/t\/\w+/g, '')
      .trim();
    const gitLabNormalizedChecklist = normalizeGitLabIssueChecklist(
      gitLabChecklistText
    );
    const clickUp = new ClickUp(clickUpTaskId);
    const clickUpTasks = await clickUp.getTask();
    let clickUpChecklist = clickUpTasks.checklists.find(
      (c: any) => c.name === 'GitLab synced checklist'
    );
    if (!clickUpChecklist) {
      clickUpChecklist = (
        await clickUp.createChecklist('GitLab synced checklist')
      ).checklist;
    }
    const clickUpNormalizedChecklist = normalizeClickUpChecklist(
      clickUpChecklist.items
    );
    const actions = getSyncChecklistActions(
      clickUpNormalizedChecklist,
      gitLabNormalizedChecklist
    );
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
        const n = items.length === 1 ? 'item' : 'items';
        return `${s} ${n} ${action}d`;
      })
      .join(', ');
    console.log(
      `[${gitLabProjectId.replace(
        '%2F',
        '/'
      )} #${issueNumber}] ${new Date().toLocaleString()} ${status}`
    );
  }
}
