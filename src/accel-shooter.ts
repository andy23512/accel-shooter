import { copyFileSync } from 'fs';
import open from 'open';
import { resolve as pathResolve } from 'path';
import { CONFIG } from './config';
import { ClickUp } from './clickup';
import { GitLab, getGitLabBranchNameFromIssueNumberAndTitle } from './gitlab';
import { dashify } from './utils';
import inquirer from 'inquirer';

(async () => {
  const action = process.argv[2];
  switch (action) {
    case 'config':
    case 'c':
      const configFile = process.argv[3];
      setConfigFile(configFile);
      break;
    case 'start':
    case 's':
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
      break;
    default:
      throw Error(`Action {action} is not supported`);
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
