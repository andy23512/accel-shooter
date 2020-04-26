import fetch, { Response } from 'node-fetch';
import { Site, HttpMethod, NormalizedChecklist } from './models/models';
import { CONFIG } from './config';
import { ChecklistItem } from './models/clickup.models';
import { GitLab } from './gitlab';
import { ClickUp } from './clickup';

function checkStatus(res: Response) {
  if (res.ok) {
    return res;
  } else {
    throw Error(res.statusText);
  }
}

export function callApiFactory(site: Site) {
  let apiUrl = '';
  let headers = {};
  switch (site) {
    case 'GitLab':
      apiUrl = 'https://gitlab.com/api/v4';
      headers = { 'Private-Token': CONFIG.GitLabToken };
      break;
    case 'ClickUp':
      apiUrl = 'https://api.clickup.com/api/v2';
      headers = { Authorization: CONFIG.ClickUpToken };
      break;
    default:
      throw Error(`Site {site} is not supported.`);
  }
  return async <T>(
    method: HttpMethod,
    url: string,
    body?: { [key: string]: any }
  ): Promise<T> => {
    const params = new URLSearchParams();
    if (body) {
      Object.entries(body).forEach(([key, value]) => {
        params.set(key, value);
      });
    }
    return fetch(
      apiUrl + url,
      method === 'get'
        ? {
            method,
            headers,
          }
        : { method, headers, body: params }
    )
      .then(checkStatus)
      .then((res) => res.json());
  };
}

export function dashify(input: string) {
  let temp = input
    .replace(/[^A-Za-z0-9]/g, '-')
    .replace(/-{2,}/g, '-')
    .toLowerCase();
  if (temp.length >= 100) {
    temp = temp.substring(0, 100);
    return temp.substring(0, temp.lastIndexOf('-'));
  }
  return temp;
}

export function normalizeGitLabIssueChecklist(
  checklistText: string
): NormalizedChecklist {
  return checklistText.split('\n').map((line, index) => ({
    name: line
      .replace(/- \[[x ]\] /g, '')
      .replace(/^ +/, (space) => space.replace(/ /g, '-')),
    checked: /- \[x\]/.test(line),
    order: index,
  }));
}

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
    console.log(new Date().toLocaleString());
    console.log(status);
  }
}
