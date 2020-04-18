import { copyFileSync } from 'fs';
import open from 'open';
import { resolve as pathResolve } from 'path';
import { CONFIG } from './config';
import { getClickUpTask, setClickUpTaskStatus } from './clickup';
import { addGitLabIssue } from './gitlab';

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
      const gitLabProjectId = getGitLabProjectId();
      const clickUpTaskId = getClickUpTaskId();
      const clickUpTask = await getClickUpTask(clickUpTaskId);
      const clickUpTaskUrl = clickUpTask['url'];
      const gitLabIssueTitle =
        process.argv.length >= 6 ? process.argv[5] : clickUpTask['name'];
      await setClickUpTaskStatus(clickUpTaskId, 'in progress');
      const gitLabIssue = await addGitLabIssue(
        gitLabProjectId,
        gitLabIssueTitle,
        clickUpTaskUrl
      );
      const gitLabIssueUrl = gitLabIssue.web_url;
      const gitLabIssueNumber = gitLabIssue.iid;
      console.log(`GitLab Issue Number: ${gitLabIssueNumber}`);
      console.log(`GitLab Issue: ${gitLabIssueUrl}`);
      console.log(`ClickUp Task: ${clickUpTaskUrl}`);
      console.log(`HackMD Daily Progress: ${CONFIG.HackMDNoteUrl}`);
      open(CONFIG.HackMDNoteUrl);
      open(clickUpTaskUrl);
      open(gitLabIssueUrl);
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
