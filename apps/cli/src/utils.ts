import childProcess, { execSync, StdioOptions } from 'child_process';
import notifier from 'node-notifier';
import open from 'open';
import qs from 'qs';

import {
  ClickUp,
  CONFIG,
  DateFormat,
  GitLab,
} from '@accel-shooter/node-shared';
import { parse } from 'date-fns';
import { readFileSync } from 'fs';
import { render } from 'mustache';
import untildify from 'untildify';

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

export async function getInfoFromArgument(
  argument: string,
  clickUpOnly?: boolean,
  allowEmptyInfo?: boolean
) {
  let clickUpTaskId = argument;
  if (!clickUpTaskId) {
    const branchName = execSync('git branch --show-current', {
      encoding: 'utf-8',
    });
    const match = branchName.match(/CU-([a-z0-9]+)/);
    if (!match) {
      if (allowEmptyInfo) {
        return {
          gitLab: null,
          gitLabProject: null,
          mergeRequestIId: null,
          mergeRequest: null,
          clickUp: null,
          clickUpTaskId: null,
          clickUpTask: null,
        };
      }
      throw Error('Cannot get task number from branch');
    }
    clickUpTaskId = match[1];
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

export function getRepoName() {
  return execSync('basename -s .git `git config --get remote.origin.url`')
    .toString()
    .trim();
}

export function getDayFromArgument(argument: any, dft?: Date) {
  const today = new Date();
  return argument
    ? parse(argument, DateFormat.STANDARD, today)
    : dft
    ? new Date(dft.valueOf())
    : today;
}

export function displayNotification(message: string) {
  notifier.notify({
    title: 'Accel Shooter',
    message,
  });
}

export function renderTodoList(
  todoConfig: string[],
  gitLabProjectName: string
) {
  const todoConfigMap: Record<string, boolean> = {};
  todoConfig.forEach((c) => {
    todoConfigMap[c] = true;
  });
  todoConfigMap[gitLabProjectName] = true;
  const template = readFileSync(untildify(CONFIG.ToDoTemplate), {
    encoding: 'utf-8',
  });
  return render(template, todoConfigMap);
}
