import clipboardy from 'clipboardy';
import { format } from 'date-fns';
import { readFileSync } from 'fs';
import inquirer from 'inquirer';
import { render } from 'mustache';
import open from 'open';
import os from 'os';
import { setIntervalAsync } from 'set-interval-async/dynamic';
import untildify from 'untildify';
import { configReadline, setUpSyncHotkey, syncChecklist } from './actions';
import { ClickUp } from './clickup';
import { CONFIG } from './config';
import { DailyProgress } from './daily-progress';
import {
  getGitLabBranchNameFromIssueNumberAndTitleAndTaskId,
  GitLab,
} from './gitlab';
import { Tracker } from './tracker';
import {
  getClickUpTaskIdFromGitLabIssue,
  getGitLabProjectConfigByName,
  promiseSpawn,
  updateTaskStatusInDp,
} from './utils';

const actionAlias: { [key: string]: string } = {
  st: 'start',
  o: 'open',
  sy: 'sync',
  c: 'copy',
  t: 'track',
  e: 'end',
};

const actions: { [key: string]: () => Promise<any> } = {
  async start() {
    configReadline();
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
        default: async (answers: { clickUpTaskId: string }) => {
          let task = await new ClickUp(answers.clickUpTaskId).getTask();
          let result = task.name;
          while (task.parent) {
            task = await new ClickUp(task.parent).getTask();
            result = `${task.name} - ${result}`;
          }
          return result;
        },
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
      {
        name: 'todoConfig',
        message: 'Choose Preset To-do Config',
        type: 'checkbox',
        choices: CONFIG.ToDoConfigChoices,
      },
      {
        name: 'clickUpListAndTagConfirm',
        message: 'Check the ClickUp task list and tag',
        type: 'confirm',
        default: true,
      },
    ]);
    const gitLab = new GitLab(answers.gitLabProject.id);
    const clickUp = new ClickUp(answers.clickUpTaskId);
    const selectedGitLabLabels = answers.labels;
    const clickUpTask = await clickUp.getTask();
    const clickUpTaskUrl = clickUpTask['url'];
    const gitLabIssueTitle = answers.issueTitle;
    await clickUp.setTaskStatus('in progress');
    const todoConfigMap: Record<string, boolean> = {};
    answers.todoConfig.forEach((c: string) => {
      todoConfigMap[c] = true;
    });
    const template = readFileSync(untildify(CONFIG.ToDoTemplate), {
      encoding: 'utf-8',
    });
    const endingTodo = render(template, todoConfigMap);
    const gitLabIssue = await gitLab.createIssue(
      gitLabIssueTitle,
      `${clickUpTaskUrl}\n\n${endingTodo}`,
      selectedGitLabLabels
    );
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
    await promiseSpawn('git', ['fetch']);
    await sleep(1000);
    await promiseSpawn('git', ['checkout', gitLabBranch.name]);
    const dailyProgressString = `* (In Progress) ${gitLabIssue.title} (#${gitLabIssueNumber}, ${clickUpTaskUrl})`;
    new DailyProgress().addProgressToBuffer(dailyProgressString);
    const syncCommand = `acst sync ${answers.gitLabProject.name} ${gitLabIssueNumber}`;
    clipboardy.writeSync(syncCommand);
    console.log(`Sync command: "${syncCommand}" Copied!`);
    new Tracker().addItem(answers.gitLabProject.name, gitLabIssueNumber);
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
    configReadline();
    const gitLabProjectId = getGitLabProjectIdFromArgv();
    const issueNumber = process.argv[4];
    setUpSyncHotkey(gitLabProjectId, issueNumber);
    await syncChecklist(gitLabProjectId, issueNumber, true);
    setIntervalAsync(async () => {
      await syncChecklist(gitLabProjectId, issueNumber);
    }, 5 * 60 * 1000);
  },
  async copy() {
    const day =
      process.argv.length >= 4
        ? process.argv[3]
        : format(new Date(), 'yyyy/MM/dd');
    const dp = new DailyProgress();
    const record = dp.getRecordByDay(day);
    if (record) {
      const newDpRecord = await updateTaskStatusInDp(record);
      dp.writeRecordByDay(day, newDpRecord);
      clipboardy.writeSync(newDpRecord);
      console.log(newDpRecord);
      console.log('Copied!');
    }
  },
  async track() {
    const tracker = new Tracker();
    tracker.startSync();
  },
  async end() {
    const gitLabProjectId = getGitLabProjectIdFromArgv();
    const issueNumber = process.argv[4];
    const gitLab = new GitLab(gitLabProjectId);
    const issue = await gitLab.getIssue(issueNumber);
    const mergeRequests = await gitLab.listMergeRequestsWillCloseIssueOnMerge(
      issueNumber
    );
    const mergeRequest = mergeRequests[mergeRequests.length - 1];
    await gitLab.markMergeRequestAsReadyAndAddAssignee(mergeRequest);
    const clickUpTaskId = getClickUpTaskIdFromGitLabIssue(issue);
    if (clickUpTaskId) {
      const clickUp = new ClickUp(clickUpTaskId);
      await clickUp.setTaskStatus('in review');
    }
    console.log('End command is executed successfully');
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

function getGitLabProjectIdByName(name: string) {
  const gitLabProjectId = getGitLabProjectConfigByName(name)?.id;
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
