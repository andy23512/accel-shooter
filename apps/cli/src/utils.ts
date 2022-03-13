import {
  ClickUp,
  CONFIG,
  FullMergeRequest,
  GitLab,
  normalizeMarkdownChecklist,
  Task,
  titleCase,
} from '@accel-shooter/node-shared';
import childProcess, { execSync, StdioOptions } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import open from 'open';
import { join } from 'path';
import qs from 'qs';

export async function promiseSpawn(
  command: string,
  args: string[],
  stdio?: 'pipe'
): Promise<{ stdout: string; stderr: string; code: number }>;
export async function promiseSpawn(
  command: string,
  args: string[],
  stdio?: 'inherit'
): Promise<number>;
export async function promiseSpawn(
  command: string,
  args: string[],
  stdio: StdioOptions = 'inherit'
) {
  return new Promise((resolve, reject) => {
    const child = childProcess.spawn(command, args, {
      shell: true,
      stdio,
    });
    if (stdio === 'pipe') {
      let stdout = '';
      let stderr = '';
      child.stdout?.on('data', (d) => {
        const output = d.toString();
        stdout += output;
      });
      child.stderr?.on('data', (d) => {
        const output = d.toString();
        stderr += output;
      });
      child.on('close', (code) => {
        resolve({ stdout, stderr, code });
      });
    } else {
      child.on('close', (code) => (code === 0 ? resolve(1) : reject()));
    }
    child.on('error', (err) => {
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

export function getClickUpTaskIdFromGitLabMergeRequest(
  mergeRequest: FullMergeRequest
) {
  const branchName = mergeRequest.source_branch;
  const result = branchName.match(/CU-([a-z0-9]+)/);
  return result ? result[1] : null;
}

const dpItemRegex =
  /\* \([A-Za-z0-9 %]+\) \[.*?\]\(https:\/\/app.clickup.com\/t\/(\w+)\)/g;

export async function updateTaskStatusInDp(dp: string) {
  let match: RegExpExecArray | null = null;
  let resultDp = dp;

  while ((match = dpItemRegex.exec(dp))) {
    const full = match[0];
    const clickUpTaskId = match[1];
    const clickUp = new ClickUp(clickUpTaskId);
    const task = await clickUp.getTask();
    const progress = getTaskProgress(task);
    const updatedFull = full.replace(
      /\* \([A-Za-z0-9 %]+\)/,
      task.status.status === 'in progress' && progress
        ? `* (${titleCase(task.status.status)} ${progress})`
        : `* (${titleCase(task.status.status)})`
    );
    resultDp = resultDp.replace(full, updatedFull);
  }
  return resultDp;
}

export async function getInfoFromArgv(clickUpOnly?: boolean) {
  let clickUpTaskId = null;
  if (process.argv.length === 3) {
    const branchName = execSync('git branch --show-current', {
      encoding: 'utf-8',
    });
    const match = branchName.match(/CU-([a-z0-9]+)/);
    if (!match) {
      throw Error('Cannot get task number from branch');
    }
    clickUpTaskId = match[1];
  } else {
    clickUpTaskId = process.argv[3];
  }
  if (clickUpTaskId) {
    const clickUp = new ClickUp(clickUpTaskId);
    const clickUpTask = await clickUp.getTask();
    if (clickUpOnly) {
      return { clickUpTask, clickUp, clickUpTaskId };
    }
    const { gitLabProject, mergeRequestIId } =
      await clickUp.getGitLabProjectAndMergeRequestIId();
    const gitLab = new GitLab(gitLabProject.id);
    const mergeRequest = await gitLab.getMergeRequest(mergeRequestIId);
    return {
      gitLab,
      gitLabProject,
      mergeRequestIId,
      mergeRequest,
      clickUp,
      clickUpTaskId,
      clickUpTask,
    };
  } else {
    throw Error('No task id specified');
  }
}

export async function checkWorkingTreeClean() {
  const result = await promiseSpawn('git', ['status'], 'pipe');
  return (
    result.stdout.includes('Your branch is up to date with') &&
    result.stdout.includes('nothing to commit, working tree clean')
  );
}

export function openUrlsInTabGroup(urls: string[], group: string) {
  open(
    'http://localhost:8315/accel-shooter/?' +
      qs.stringify({
        urls: JSON.stringify(urls),
        group,
      })
  );
}

export function getTaskProgress(task: Task) {
  const path = join(CONFIG.TaskTodoFolder, task.id + '.md');
  if (existsSync(path)) {
    const content = readFileSync(path, { encoding: 'utf-8' });
    const checklist = normalizeMarkdownChecklist(content);
    const total = checklist.length;
    const done = checklist.filter((c) => c.checked).length;
    return `${Math.round((done / total) * 100)}%`;
  } else {
    return null;
  }
}
