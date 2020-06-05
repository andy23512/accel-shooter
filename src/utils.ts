import fetch, { Response } from 'node-fetch';
import { Site, HttpMethod, NormalizedChecklist } from './models/models';
import { CONFIG } from './config';
import { ChecklistItem } from './models/clickup.models';

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
    .replace(/-+$/, '')
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
