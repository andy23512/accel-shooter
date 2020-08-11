import { copyFileSync } from 'fs';
import open from 'open';
import { resolve as pathResolve } from 'path';
import { CONFIG } from './config';
import { ClickUp } from './clickup';
import {
  GitLab,
  getGitLabBranchNameFromIssueNumberAndTitleAndTaskId,
} from './gitlab';
import inquirer from 'inquirer';
import { setIntervalAsync } from 'set-interval-async/dynamic';
import { syncChecklist } from './actions';
import clipboardy from 'clipboardy';
import { promiseSpawn } from './utils';
import os from 'os';

const actionAlias: { [key: string]: string } = {
  c: 'config',
  st: 'start',
  o: 'open',
  sy: 'sync',
};

const actions: { [key: string]: () => Promise<any> } = {
  async config() {
    const configFile = process.argv[3];
    setConfigFile(configFile);
  },
  async start() {
    const answers = await inquirer.prompt([
      {
        name: 'gitLabProject',
        message: 'Choose GitLab Project',
        type: 'list',
        choices: CONFIG.GitLabProjects.map((p) => ({
          name: `${p.name} (${p.repo})`,
          value: p,
        })),
      },
      {
        name: 'clickUpTaskId',
        message: 'Enter ClickUp Task ID',
        type: 'input',
        filter: (input) => input.replace('#', ''),
      },
      {
        name: 'issueTitle',
        message: 'Enter Issue Title',
        type: 'input',
        default: async (answers: any) =>
          new ClickUp(answers.clickUpTaskId)
            .getTask()
            .then((task) => task.name),
      },
      {
        name: 'labels',
        message: 'Choose GitLab Labels to add to new Issue',
        type: 'checkbox',
        choices: async ({ gitLabProject }) =>
          new GitLab(gitLabProject.id)
            .listProjectLabels()
            .then((labels) => labels.map((label: any) => label.name)),
      },
    ]);
    const gitLab = new GitLab(answers.gitLabProject.id);
    const clickUp = new ClickUp(answers.clickUpTaskId);
    const selectedGitLabLabels = answers.labels;
    const clickUpTask = await clickUp.getTask();
    const clickUpTaskUrl = clickUpTask['url'];
    const gitLabIssueTitle = answers.issueTitle;
    await clickUp.setTaskStatus('in progress');
    const gitLabIssue = await gitLab.createIssue(
      gitLabIssueTitle,
      clickUpTaskUrl,
      selectedGitLabLabels
    );
    const gitLabIssueUrl = gitLabIssue.web_url;
    const gitLabIssueNumber = gitLabIssue.iid;
    const gitLabBranch = await gitLab.createBranch(
      getGitLabBranchNameFromIssueNumberAndTitleAndTaskId(
        gitLabIssueNumber,
        gitLabIssueTitle,
        answers.clickUpTaskId
      )
    );
    await gitLab.createMergeRequest(
      gitLabIssueNumber,
      gitLabIssueTitle,
      gitLabBranch.name,
      selectedGitLabLabels
    );
    process.chdir(answers.gitLabProject.path.replace('~', os.homedir()));
    await promiseSpawn('git', ['pull']);
    await sleep(1000);
    await promiseSpawn('git', ['checkout', gitLabBranch.name]);
    console.log(`GitLab Issue Number: ${gitLabIssueNumber}`);
    const dailyProgressString = `* (Processing) ${gitLabIssue.title} (#${gitLabIssueNumber}, ${clickUpTaskUrl})`;
    console.log(`Daily Progress string: ${dailyProgressString} (Copied)`);
    clipboardy.writeSync(dailyProgressString);
    open(gitLabIssueUrl);
    await syncChecklist(answers.gitLabProject.id, gitLabIssueNumber.toString());
    setIntervalAsync(async () => {
      await syncChecklist(
        answers.gitLabProject.id,
        gitLabIssueNumber.toString()
      );
    }, 5 * 60 * 1000);
  },
  async open() {
    const issueNumber = process.argv[4];
    const gitLab = new GitLab(getGitLabProjectIdFromArgv());
    const answers = await inquirer.prompt([
      {
        name: 'types',
        message: 'Choose Link Type to open',
        type: 'checkbox',
        choices: [
          { name: 'Issue', value: 'issue' },
          { name: 'Merge Request', value: 'merge-request' },
          { name: 'Task', value: 'task' },
        ],
      },
    ]);
    const issue = await gitLab.getIssue(issueNumber);
    for (const type of answers.types) {
      switch (type) {
        case 'issue':
          open(issue.web_url);
          break;
        case 'merge-request':
          const mergeRequests = await gitLab.listMergeRequestsWillCloseIssueOnMerge(
            issueNumber
          );
          open(mergeRequests[mergeRequests.length - 1].web_url);
          break;
        case 'task':
          const description = issue.description;
          const result = description.match(/https:\/\/app.clickup.com\/t\/\w+/);
          if (result) {
            open(result[0]);
          }
          break;
      }
    }
  },
  async sync() {
    const gitLabProjectId = getGitLabProjectIdFromArgv();
    const issueNumber = process.argv[4];
    await syncChecklist(gitLabProjectId, issueNumber);
    setIntervalAsync(async () => {
      await syncChecklist(gitLabProjectId, issueNumber);
    }, 5 * 60 * 1000);
  },
};

(async () => {
  const action = actionAlias[process.argv[2]] || process.argv[2];
  if (actions[action]) {
    await actions[action]();
  } else {
    throw Error(`Action ${action} is not supported.`);
  }
})();

function setConfigFile(configFile: string) {
  const src = pathResolve(configFile);
  const dest = pathResolve(__dirname, '../.config.json');
  copyFileSync(src, dest);
}

function getGitLabProjectByName(n: string) {
  return CONFIG.GitLabProjects.find(({ name }) => name === n);
}

function getGitLabProjectIdByName(name: string) {
  const gitLabProjectId = getGitLabProjectByName(name)?.id;
  if (!gitLabProjectId) {
    throw new Error('Cannot find project');
  }
  return gitLabProjectId;
}

function getGitLabProjectIdFromArgv() {
  return getGitLabProjectIdByName(process.argv[3]);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
