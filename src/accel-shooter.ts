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
        name: 'gitLabProjectId',
        message: 'Choose GitLab Project',
        type: 'checkbox',
        choices: Object.entries(CONFIG.GitLabProjectMap).map(
          ([name, projectId]) => ({
            name: `${name} (${projectId})`,
            value: projectId.replace(/\//g, '%2F'),
          })
        ),
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
        choices: async ({ gitLabProjectId }) =>
          new GitLab(gitLabProjectId)
            .listProjectLabels()
            .then((labels) => labels.map((label: any) => label.name)),
      },
    ]);
    const gitLab = new GitLab(answers.gitLabProjectId);
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
    console.log(`GitLab Issue Number: ${gitLabIssueNumber}`);
    const dailyProgressString = `* (Processing) ${gitLabIssue.title} (#${gitLabIssueNumber}, ${clickUpTaskUrl})`;
    console.log(`Daily Progress string: ${dailyProgressString} (Copied)`);
    clipboardy.writeSync(dailyProgressString);
    open(CONFIG.HackMDNoteUrl);
    open(clickUpTaskUrl);
    open(gitLabIssueUrl);
  },
  async open() {
    const issueNumber = process.argv[4];
    const gitLab = new GitLab(getGitLabProjectId());
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
    const gitLabProjectId = getGitLabProjectId();
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

function getGitLabProjectId() {
  return (CONFIG.GitLabProjectMap[process.argv[3]] || process.argv[3]).replace(
    /\//g,
    '%2F'
  );
}

function getClickUpTaskId() {
  return process.argv[4].replace(/#/g, '');
}
