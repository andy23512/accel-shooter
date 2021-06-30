import childProcess, { execSync, StdioOptions } from "child_process";
import { titleCase } from "./case-utils";
import { ClickUp } from "./classes/clickup.class";
import { GitLab } from "./classes/gitlab.class";
import { CONFIG } from "./config";
import { ChecklistItem } from "./models/clickup.models";
import { Issue } from "./models/gitlab/issue.models";
import { NormalizedChecklist } from "./models/models";

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

export async function promiseSpawn(
  command: string,
  args: string[],
  stdio?: "pipe"
): Promise<{ stdout: string; stderr: string; code: number }>;
export async function promiseSpawn(
  command: string,
  args: string[],
  stdio?: "inherit"
): Promise<number>;
export async function promiseSpawn(
  command: string,
  args: string[],
  stdio: StdioOptions = "inherit"
) {
  return new Promise((resolve, reject) => {
    const child = childProcess.spawn(command, args, {
      shell: true,
      stdio,
    });
    if (stdio === "pipe") {
      let stdout = "";
      let stderr = "";
      child.stdout?.on("data", (d) => {
        const output = d.toString();
        stdout += output;
      });
      child.stderr?.on("data", (d) => {
        const output = d.toString();
        stderr += output;
      });
      child.on("close", (code) => {
        resolve({ stdout, stderr, code });
      });
    } else {
      child.on("close", (code) => (code === 0 ? resolve(1) : reject()));
    }
    child.on("error", (err) => {
      console.log(err);
    });
  });
}

export function getGitLabProjectConfigByName(n: string) {
  return CONFIG.GitLabProjects.find(({ name }) => name === n);
}

export function getGitLabProjectConfigById(inputId: string) {
  return CONFIG.GitLabProjects.find(({ id }) => id === inputId);
}

export function getClickUpTaskIdFromGitLabIssue(issue: Issue) {
  const description = issue.description;
  const result = description.match(/https:\/\/app.clickup.com\/t\/(\w+)/);
  return result ? result[1] : null;
}

const dpItemRegex =
  /\* \([A-Za-z ]+\) .*? \((#[0-9]+|#\?|\w+ \d+), https:\/\/app.clickup.com\/t\/(\w+)\)/g;

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

export function getGitLabFromArgv() {
  if (process.argv.length === 3) {
    const directory = execSync("pwd", { encoding: "utf-8" });
    const gitLabProject = CONFIG.GitLabProjects.find((p) =>
      directory.startsWith(p.path)
    );
    if (!gitLabProject) {
      throw Error("No such project");
    }
    const branchName = execSync("git branch --show-current", {
      encoding: "utf-8",
    });
    const match = branchName.match(/^[0-9]+/);
    if (!match) {
      throw Error("Cannot get issue number from branch");
    }
    const issueNumber = match[0];
    const gitLab = new GitLab(gitLabProject.id);
    return { gitLab, gitLabProject, issueNumber };
  } else {
    const gitLabProject = getGitLabProjectFromArgv();
    if (!gitLabProject) {
      throw Error("No such project");
    }
    const gitLab = new GitLab(gitLabProject.id);
    return { gitLab, gitLabProject, issueNumber: process.argv[4] };
  }
}

function getGitLabProjectFromArgv() {
  return getGitLabProjectConfigByName(process.argv[3]);
}

export function getGitLabBranchNameFromIssueNumberAndTitleAndTaskId(
  issueNumber: number,
  clickUpTaskId: string
) {
  return `${issueNumber}_CU-${clickUpTaskId}`;
}

export async function checkWorkingTreeClean() {
  const result = await promiseSpawn("git", ["status"], "pipe");
  if (
    !result.stdout.includes("Your branch is up to date with") ||
    !result.stdout.includes("nothing to commit, working tree clean")
  ) {
    throw Error(
      "Working tree is not clean or something is not pushed. Aborted."
    );
  }
}
