import {
  ClickUp,
  CONFIG,
  GitLab,
  GitLabProject,
  sleep,
} from '@accel-shooter/node-shared';
import { readFileSync, writeFileSync } from 'fs';
import inquirer from 'inquirer';
import { render } from 'mustache';
import os from 'os';
import { join } from 'path';
import untildify from 'untildify';
import { CustomProgressLog } from '../classes/progress-log.class';
import { Todo } from '../classes/todo.class';
import { Tracker } from '../classes/tracker.class';
import { checkWorkingTreeClean, getRepoName, promiseSpawn } from '../utils';
import { openAction } from './open.action';

export async function startAction() {
  const repoName = getRepoName();
  const index = CONFIG.GitLabProjects.findIndex((p) =>
    p.repo.endsWith(`/${repoName}`)
  );
  const answers = await inquirer.prompt([
    {
      name: 'gitLabProject',
      message: 'Choose GitLab Project',
      type: 'list',
      choices: CONFIG.GitLabProjects.map((p) => ({
        name: `${p.name} (${p.repo})`,
        value: p,
      })),
      default: index >= 0 ? index : null,
      async filter(input: any) {
        process.chdir(input.path.replace('~', os.homedir()));
        const isClean = await checkWorkingTreeClean();
        if (!isClean) {
          console.log(
            '\nWorking tree is not clean or something is not pushed. Aborted.'
          );
          process.exit();
        }
        return input;
      },
    },
    {
      name: 'clickUpTaskId',
      message: 'Enter ClickUp Task ID',
      type: 'input',
      filter: (input) => input.replace('#', ''),
    },
    {
      name: 'mergeRequestTitle',
      message: 'Enter Merge Request Title',
      type: 'input',
      default: async (answers: {
        clickUpTaskId: string;
        gitLabProject: GitLabProject;
      }) => {
        let task = await new ClickUp(answers.clickUpTaskId).getTask();
        const user = (await ClickUp.getCurrentUser()).user;
        if (!task.assignees.find((a) => a.id === user.id)) {
          console.log('\nTask is not assigned to you. Aborted.');
          process.exit();
        }
        if (answers.gitLabProject.clickUpSpaces) {
          const spaceName = (await ClickUp.getSpace(task.space.id)).name;
          if (!answers.gitLabProject.clickUpSpaces.includes(spaceName)) {
            console.log('\nTask is not in spaces of project. Aborted.');
            process.exit();
          }
        }
        let result = task.name;
        while (task.parent) {
          task = await new ClickUp(task.parent).getTask();
          result = `${task.name} - ${result}`;
        }
        return result;
      },
    },
    {
      name: 'todoConfig',
      message: 'Choose Preset To-do Config',
      type: 'checkbox',
      choices: CONFIG.ToDoConfigChoices,
    },
  ]);
  const p = new CustomProgressLog('Start', [
    'Get ClickUp Task',
    'Set ClickUp Task Status',
    'Render Todo List',
    'Create GitLab Branch',
    'Create GitLab Merge Request',
    'Create Checklist at ClickUp',
    'Add Todo Entry',
    'Add Tracker Item',
    'Do Git Fetch and Checkout',
  ]);
  process.chdir(answers.gitLabProject.path.replace('~', os.homedir()));
  await checkWorkingTreeClean();
  const gitLab = new GitLab(answers.gitLabProject.id);
  const clickUp = new ClickUp(answers.clickUpTaskId);
  p.start(); // Get ClickUp Task
  const clickUpTask = await clickUp.getTask();
  const clickUpTaskUrl = clickUpTask['url'];
  const gitLabMergeRequestTitle = answers.mergeRequestTitle;
  p.next(); // Set ClickUp Task Status
  await clickUp.setTaskStatus('in progress');
  p.next(); // Render Todo List
  const todoConfigMap: Record<string, boolean> = {};
  answers.todoConfig.forEach((c: string) => {
    todoConfigMap[c] = true;
  });
  todoConfigMap[answers.gitLabProject.name] = true;
  const template = readFileSync(untildify(CONFIG.ToDoTemplate), {
    encoding: 'utf-8',
  });
  const endingTodo = render(template, todoConfigMap);
  const path = join(CONFIG.TaskTodoFolder, answers.clickUpTaskId + '.md');
  writeFileSync(path, endingTodo);
  p.next(); // Create GitLab Branch
  const gitLabBranch = await gitLab.createBranch(`CU-${answers.clickUpTaskId}`);
  p.next(); // Create GitLab Merge Request
  await sleep(2000); // prevent "branch restored" bug
  const gitLabMergeRequest = await gitLab.createMergeRequest(
    gitLabMergeRequestTitle + `__CU-${answers.clickUpTaskId}`,
    gitLabBranch.name,
    answers.gitLabProject.hasMergeRequestTemplate
      ? await gitLab.getMergeRequestTemplate()
      : ''
  );
  const gitLabMergeRequestIId = gitLabMergeRequest.iid;
  await gitLab.createMergeRequestNote(
    gitLabMergeRequest,
    `ClickUp Task: [${gitLabMergeRequestTitle}](${clickUpTaskUrl})`
  );
  p.next(); // Create Checklist at ClickUp
  const clickUpChecklistTitle = `Synced checklist [${answers.gitLabProject.id.replace(
    '%2F',
    '/'
  )} !${gitLabMergeRequestIId}]`;
  let clickUpChecklist = clickUpTask.checklists.find(
    (c) => c.name === clickUpChecklistTitle
  );
  if (!clickUpChecklist) {
    clickUpChecklist = (await clickUp.createChecklist(clickUpChecklistTitle))
      .checklist;
    await clickUp.updateChecklist(clickUpChecklist, endingTodo);
  }
  p.next(); // Add Todo Entry
  const todoString = `- [ ] [${gitLabMergeRequestTitle}](${clickUpTaskUrl})`;
  new Todo().addTodoToBuffer(todoString);
  p.next(); // Add Tracker Item
  new Tracker().addItem(answers.clickUpTaskId);
  p.next(); // Do Git Fetch and Checkout
  process.chdir(answers.gitLabProject.path.replace('~', os.homedir()));
  await promiseSpawn('git', ['fetch'], 'pipe');
  await sleep(1000);
  await promiseSpawn('git', ['checkout', gitLabBranch.name], 'pipe');
  await promiseSpawn(
    'git',
    ['submodule', 'update', '--init', '--recursive'],
    'pipe'
  );
  await openAction();
  p.end(0);
}
