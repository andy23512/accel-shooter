import { SummarizedTask } from '@accel-shooter/api-interfaces';
import { Presets, SingleBar } from 'cli-progress';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { CONFIG } from '../config';
import { ChecklistResponse } from '../models/clickup.models';
import { Comment } from '../models/clickup/comment.models';
import { List } from '../models/clickup/list.models';
import { TaskIncludeSubTasks } from '../models/clickup/task.models';
import { Team } from '../models/clickup/team.models';
import { User } from '../models/clickup/user.models';
import { callApiFactory } from '../utils/api.utils';
import { titleCase } from '../utils/case.utils';
import { normalizeMarkdownChecklist } from '../utils/checklist.utils';
import { Task } from './../models/clickup/task.models';
const callApi = callApiFactory('ClickUp');

export class ClickUp {
  constructor(public taskId: string) {}

  public static getCurrentUser() {
    return callApi<{ user: User }>('get', `/user/`);
  }

  public static getList(listId: string) {
    return callApi<List>('get', `/list/${listId}`);
  }

  public static getTeams() {
    return callApi<{ teams: Team[] }>('get', `/team/`);
  }

  public static getRTVTasks(teamId: string, userID: number) {
    return callApi<{ tasks: Task[] }>('get', `/team/${teamId}/task/`, {
      statuses: ['ready to verify'],
      include_closed: true,
      assignees: [userID],
    });
  }

  public static getMyTasks(teamId: string, userID: number) {
    return callApi<{ tasks: Task[] }>('get', `/team/${teamId}/task/`, {
      statuses: ['Open', 'pending', 'ready to do', 'in progress'],
      assignees: [userID],
      subtasks: true,
    });
  }

  public getTask() {
    return callApi<Task>('get', `/task/${this.taskId}`);
  }

  public getTaskIncludeSubTasks() {
    return callApi<TaskIncludeSubTasks>('get', `/task/${this.taskId}`, {
      include_subtasks: true,
    });
  }

  public getTaskComments() {
    return callApi<{ comments: Comment[] }>(
      'get',
      `/task/${this.taskId}/comment/`
    ).then((r) => r.comments);
  }

  public setTaskStatus(status: string) {
    return callApi<Task>('put', `/task/${this.taskId}`, null, { status });
  }

  public createChecklist(name: string) {
    return callApi<ChecklistResponse>(
      'post',
      `/task/${this.taskId}/checklist`,
      null,
      { name }
    );
  }

  public createChecklistItem(
    checklistId: string,
    name: string,
    resolved: boolean,
    orderindex: number
  ) {
    return callApi<ChecklistResponse>(
      'post',
      `/checklist/${checklistId}/checklist_item`,
      null,
      {
        name,
        resolved,
        orderindex,
      }
    );
  }

  public updateChecklistItem(
    checklistId: string,
    checklistItemId: string,
    name: string,
    resolved: boolean,
    orderindex: number
  ) {
    return callApi<ChecklistResponse>(
      'put',
      `/checklist/${checklistId}/checklist_item/${checklistItemId}`,
      null,
      {
        name,
        resolved,
        orderindex,
      }
    );
  }

  public deleteChecklistItem(checklistId: string, checklistItemId: string) {
    return callApi<void>(
      'delete',
      `/checklist/${checklistId}/checklist_item/${checklistItemId}`
    );
  }

  public async getFrameUrls() {
    let currentTaskId = this.taskId;
    let rootTaskId = null;
    const frameUrls: string[] = [];
    while (currentTaskId) {
      const clickUp = new ClickUp(currentTaskId);
      const task = await clickUp.getTask();
      if (!task.parent) {
        rootTaskId = task.id;
      }
      currentTaskId = task.parent;
    }
    const taskQueue: string[] = [rootTaskId as string];
    while (taskQueue.length > 0) {
      const taskId = taskQueue.shift() as string;
      const clickUp = new ClickUp(taskId);
      const comments = await clickUp.getTaskComments();
      comments.forEach((co) => {
        co.comment
          .filter((c) => c.type === 'frame')
          .forEach((c) => {
            if (c?.frame?.url) {
              frameUrls.push(c.frame.url);
            }
          });
      });
      const task = await clickUp.getTaskIncludeSubTasks();
      if (task.subtasks) {
        task.subtasks.forEach((t) => {
          taskQueue.push(t.id);
        });
      }
    }
    return frameUrls;
  }

  public async getGitLabProjectAndMergeRequestIId() {
    const task = await this.getTask();
    const clickUpChecklist = task.checklists.find((c) =>
      c.name.toLowerCase().includes('synced checklist')
    );
    if (clickUpChecklist) {
      const match = clickUpChecklist.name.match(/\[(.*?) !([\d]+)\]/);
      if (match) {
        return {
          gitLabProject: CONFIG.GitLabProjects.find(
            (p) => p.repo.toLowerCase() === match[1].toLowerCase()
          ),
          mergeRequestIId: match[2],
        };
      }
    }
    return null;
  }

  public async getFullTaskName(task?: Task) {
    let t = task || (await this.getTask());
    let result = t.name;
    while (t.parent) {
      t = await new ClickUp(t.parent).getTask();
      result = `${t.name} - ${result}`;
    }
    return result;
  }

  public async getTaskString(mode: 'todo' | 'dp') {
    const task = await this.getTask();
    const name = await this.getFullTaskName(task);
    const progress = this.getTaskProgress();
    const link = `[${name}](${task.url})`;
    switch (mode) {
      case 'todo':
        return `- [ ] ${link}`;
      case 'dp':
        return task.status.status === 'in progress' && progress
          ? `* (${titleCase(task.status.status)} ${progress}) ${link}`
          : `* (${titleCase(task.status.status)}) ${link}`;
    }
  }

  public getTaskProgress() {
    const path = join(CONFIG.TaskTodoFolder, this.taskId + '.md');
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

  public static async getMySummarizedTasks() {
    const user = (await ClickUp.getCurrentUser()).user;
    const team = (await ClickUp.getTeams()).teams.find(
      (t) => t.name === CONFIG.ClickUpTeam
    );
    if (!team) {
      console.log('Team does not exist.');
      return;
    }
    const tasks = (await ClickUp.getMyTasks(team.id, user.id)).tasks;
    const summarizedTasks: SummarizedTask[] = [];
    const bar = new SingleBar(
      {
        stopOnComplete: true,
      },
      Presets.shades_classic
    );
    bar.start(tasks.length, 0);
    for (const task of tasks) {
      const taskPath = [task];
      let currentTask = task;
      while (currentTask.parent) {
        currentTask = await new ClickUp(currentTask.parent).getTask();
        taskPath.push(currentTask);
      }
      const simpleTaskPath = taskPath.map((t) => ({
        name: t.name,
        id: t.id,
        priority: t.priority,
        due_date: t.due_date,
      }));
      const reducedTask = simpleTaskPath.reduce((a, c) => ({
        name: c.name + ' | ' + a.name,
        id: a.id,
        priority:
          (a.priority === null && c.priority !== null) ||
          (a.priority !== null &&
            c.priority !== null &&
            parseInt(a.priority.orderindex) > parseInt(c.priority.orderindex))
            ? c.priority
            : a.priority,
        due_date:
          (a.due_date === null && c.due_date !== null) ||
          (a.due_date !== null &&
            c.due_date !== null &&
            parseInt(a.due_date) > parseInt(c.due_date))
            ? c.due_date
            : a.due_date,
      }));
      summarizedTasks.push({
        name: reducedTask.name,
        id: task.id,
        url: task.url,
        priority: reducedTask.priority,
        due_date: reducedTask.due_date,
        original_priority: task.priority,
        original_due_date: task.due_date,
        date_created: task.date_created,
        status: task.status,
      });
      bar.increment(1);
    }
    return summarizedTasks;
  }
}
