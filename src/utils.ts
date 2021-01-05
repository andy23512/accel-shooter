import childProcess from "child_process";
import fetch, { RequestInfo, RequestInit, Response } from "node-fetch";
import { titleCase } from "./case-utils";
import { ClickUp } from "./clickup";
import { CONFIG } from "./config";
import { ChecklistItem } from "./models/clickup.models";
import { Issue } from "./models/gitlab/issue.models";
import { HttpMethod, NormalizedChecklist, Site } from "./models/models";

const RETRY_SETTING = {
  retry: 5,
  pause: 12 * 1000,
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchRetry(
  url: RequestInfo,
  opts?: RequestInit & {
    retry?: number;
    callback?: (retry?: number) => any;
    pause?: number;
    silent?: boolean;
  }
) {
  let retry = (opts && opts.retry) || 3;
  while (retry > 0) {
    try {
      return await fetch(url, opts);
    } catch (e) {
      if (opts?.callback) {
        opts.callback(retry);
      }
      retry = retry - 1;
      if (retry == 0) {
        throw e;
      }

      if (opts?.pause) {
        if (!opts?.silent) console.log("pausing..");
        await sleep(opts.pause);
        if (!opts?.silent) console.log("done pausing...");
      }
    }
  }
}

function checkStatus(res: Response | undefined) {
  if (res) {
    if (res.ok) {
      return res;
    } else {
      throw Error(res.statusText);
    }
  } else {
    throw Error("Response is undefined.");
  }
}

export function callApiFactory(site: Site) {
  let apiUrl = "";
  let headers = {};
  switch (site) {
    case "GitLab":
      apiUrl = "https://gitlab.com/api/v4";
      headers = { "Private-Token": CONFIG.GitLabToken };
      break;
    case "ClickUp":
      apiUrl = "https://api.clickup.com/api/v2";
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
    return fetchRetry(
      apiUrl + url,
      method === "get"
        ? {
            method,
            headers,
            ...RETRY_SETTING,
          }
        : { method, headers, body: params, ...RETRY_SETTING }
    )
      .then(checkStatus)
      .then((res) => res.json());
  };
}

export function dashify(input: string) {
  let temp = input
    .replace(/[^A-Za-z0-9]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/-+$/, "")
    .replace(/^-+/, "")
    .toLowerCase();
  if (temp.length >= 100) {
    temp = temp.substring(0, 100);
    return temp.substring(0, temp.lastIndexOf("-"));
  }
  return temp;
}

export function normalizeGitLabIssueChecklist(
  checklistText: string
): NormalizedChecklist {
  return checklistText
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

export async function promiseSpawn(command: string, args: string[]) {
  return new Promise((resolve, reject) => {
    childProcess
      .spawn(command, args, { shell: true, stdio: "inherit" })
      .on("close", (code) => (code === 0 ? resolve() : reject()));
  });
}

export function getGitLabProjectConfigByName(n: string) {
  return CONFIG.GitLabProjects.find(({ name }) => name === n);
}

export function getClickUpTaskIdFromGitLabIssue(issue: Issue) {
  const description = issue.description;
  const result = description.match(/https:\/\/app.clickup.com\/t\/(\w+)/);
  return result ? result[1] : null;
}

const dpItemRegex = /\* \([A-Za-z ]+\) .*? \(#([0-9]+|\?), https:\/\/app.clickup.com\/t\/(\w+)\)/g;

export async function updateTaskStatusInDp(dp: string) {
  let match: RegExpExecArray | null = null;
  let resultDp = dp;

  while ((match = dpItemRegex.exec(dp))) {
    const full = match[0];
    const clickUpTaskId = match[2];
    const clickUp = new ClickUp(clickUpTaskId);
    const task = await clickUp.getTask();
    const updatedFull = full.replace(
      /\* \([A-Za-z ]+\)/,
      `* (${titleCase(task.status.status)})`
    );
    resultDp = resultDp.replace(full, updatedFull);
  }
  return resultDp;
}
