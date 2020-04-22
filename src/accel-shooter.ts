import { copyFileSync } from 'fs';
import open from 'open';
import { resolve as pathResolve } from 'path';
import { CONFIG } from './config';
import { ClickUp } from './clickup';
import { GitLab, getGitLabBranchNameFromIssueNumberAndTitle } from './gitlab';
import inquirer from 'inquirer';

const actionAlias: { [key: string]: string } = {
  c: 'config',
  s: 'start',
  o: 'open',
};

const actions: { [key: string]: () => Promise<any> } = {
  async config() {
    const configFile = process.argv[3];
    setConfigFile(configFile);
  },
  async start() {
    const gitLab = new GitLab(getGitLabProjectId());
    const clickUp = new ClickUp(getClickUpTaskId());
    const answers = await inquirer.prompt([
      {
        name: 'labels',
        message: 'Choose GitLab Labels to add to new issue',
        type: 'checkbox',
        choices: () =>
          gitLab
            .listProjectLabels()
            .then((labels) => labels.map((label: any) => label.name)),
      },
    ]);
    const selectedGitLabLabels = answers.labels;
    const clickUpTask = await clickUp.getTask();
    const clickUpTaskUrl = clickUpTask['url'];
    const gitLabIssueTitle =
      process.argv.length >= 6 ? process.argv[5] : clickUpTask['name'];
    await clickUp.setTaskStatus('in progress');
    const gitLabIssue = await gitLab.createIssue(
      gitLabIssueTitle,
      clickUpTaskUrl,
      selectedGitLabLabels
    );
    const gitLabIssueUrl = gitLabIssue.web_url;
    const gitLabIssueNumber = gitLabIssue.iid;
    const gitLabBranch = await gitLab.createBranch(
      getGitLabBranchNameFromIssueNumberAndTitle(
        gitLabIssueNumber,
        gitLabIssueTitle
      )
    );
    await gitLab.createMergeRequest(
      gitLabIssueNumber,
      gitLabIssueTitle,
      gitLabBranch.name,
      selectedGitLabLabels
    );
    console.log(`GitLab Issue Number: ${gitLabIssueNumber}`);
    console.log(`GitLab Issue: ${gitLabIssueUrl}`);
    console.log(`ClickUp Task: ${clickUpTaskUrl}`);
    console.log(`HackMD Daily Progress: ${CONFIG.HackMDNoteUrl}`);
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
          open(result[0]);
          break;
      }
    }
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
