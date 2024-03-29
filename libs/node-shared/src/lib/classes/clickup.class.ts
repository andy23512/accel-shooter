import { Presets, SingleBar } from 'cli-progress';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

import { SummarizedTask } from '@accel-shooter/api-interfaces';

import { CONFIG } from '../config';
import { ChecklistResponse } from '../models/clickup.models';
import { Checklist } from '../models/clickup/checklist.models';
import { Comment } from '../models/clickup/comment.models';
import { Group } from '../models/clickup/group.models';
import { List } from '../models/clickup/list.models';
import { Space } from '../models/clickup/space.models';
import { Task, TaskIncludeSubTasks } from '../models/clickup/task.models';
import { Team } from '../models/clickup/team.models';
import { User } from '../models/clickup/user.models';
import { TaskStatus } from '../node-shared';
import { callApiFactory } from '../utils/api.utils';
import { titleCase } from '../utils/case.utils';
import {
  getSyncChecklistActions,
  normalizeClickUpChecklist,
  normalizeMarkdownChecklist,
} from '../utils/checklist.utils';

const FIGMA_REGEX =
  /(?:https:\/\/)?(?:www\.)?figma\.com\/(file|proto)\/([0-9a-zA-Z]{22,128})(?:\/([^\?\n\r\/]+)?((?:\?[^\/]*?node-id=([^&\n\r\/]+))?[^\/]*?)(\/duplicate)?)?/g;

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

  public static getSpace(spaceId: string) {
    return callApi<Space>('get', `/space/${spaceId}`);
  }

  public static async getProduct(task: Task) {
    const space = await ClickUp.getSpace(task.space.id);
    if (space.name === 'Product Team') {
      const list = await ClickUp.getList(task.list.id);
      if (list.folder.name === 'Product Request Mgmt') {
        return list.name;
      }
      const productField = task.custom_fields?.find(
        (f) => f.name === 'Product'
      );
      if (!productField) {
        throw Error('No product field in this task');
      }
      const product = productField.type_config.options.find(
        (t: { orderindex: any }) => t.orderindex === productField.value
      );
      if (!product) {
        throw Error(`No matched product in this task (${task.id})`);
      }
      return product.name;
    }
    return space.name;
  }

  public static getRTVTasks(teamId: string, userID: number) {
    return callApi<{ tasks: Task[] }>('get', `/team/${teamId}/task/`, {
      statuses: [TaskStatus.ReadyToVerify],
      include_closed: true,
      assignees: [userID],
    });
  }

  public static getMyTasks(teamId: string, userID: number) {
    return callApi<{ tasks: Task[] }>('get', `/team/${teamId}/task/`, {
      statuses: [
        TaskStatus.Open,
        TaskStatus.Pending,
        TaskStatus.ReadyToDo,
        TaskStatus.ReadyToDev,
        TaskStatus.InProgress,
        TaskStatus.DevInProgress,
        TaskStatus.InDiscussion,
      ],
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

  public setTaskStatus(status: TaskStatus) {
    return callApi<Task>('put', `/task/${this.taskId}`, null, { status });
  }

  public setTaskTimeEstimate(timeEstimate: number) {
    return callApi<Task>('put', `/task/${this.taskId}`, null, {
      time_estimate: timeEstimate,
    });
  }

  public setTaskStartDateToToday() {
    return callApi<Task>('put', `/task/${this.taskId}`, null, {
      start_date: new Date().valueOf(),
    });
  }

  public setTaskDueDateToToday() {
    return callApi<Task>('put', `/task/${this.taskId}`, null, {
      due_date: new Date().valueOf(),
    });
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

  public async getGitLabProjectAndMergeRequestIId(task?: Task) {
    const t = task || (await this.getTask());
    const clickUpChecklist = t.checklists.find((c) =>
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
    console.warn(`No synced checklist found in this task: ${t.id}`);
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
    const gitLabInfo = await this.getGitLabProjectAndMergeRequestIId(task);
    const product =
      gitLabInfo?.gitLabProject?.name || (await ClickUp.getProduct(task));
    const link = `[${product}: ${name}](${task.url})`;
    switch (mode) {
      case 'todo':
        return `- [ ] ${link}`;
      case 'dp':
        return [TaskStatus.InProgress, TaskStatus.DevInProgress].includes(
          task.status.status as TaskStatus
        ) && progress
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
        product: await ClickUp.getProduct(task),
      });
      bar.increment(1);
    }
    return summarizedTasks;
  }

  public async updateChecklist(
    clickUpChecklist: Checklist,
    markdownChecklistString: string
  ) {
    const markdownNormalizedChecklist = normalizeMarkdownChecklist(
      markdownChecklistString,
      true
    );
    const clickUpNormalizedChecklist = normalizeClickUpChecklist(
      clickUpChecklist.items
    );
    const actions = getSyncChecklistActions(
      clickUpNormalizedChecklist,
      markdownNormalizedChecklist
    );
    if (
      actions.update.length + actions.create.length + actions.delete.length ===
      0
    ) {
      return;
    }
    for (const checklistItem of actions.update) {
      await this.updateChecklistItem(
        clickUpChecklist.id,
        checklistItem.id as string,
        checklistItem.name,
        checklistItem.checked,
        checklistItem.order
      );
    }
    for (const checklistItem of actions.create) {
      await this.createChecklistItem(
        clickUpChecklist.id,
        checklistItem.name,
        checklistItem.checked,
        checklistItem.order
      );
    }
    for (const checklistItem of actions.delete) {
      await this.deleteChecklistItem(
        clickUpChecklist.id,
        checklistItem.id as string
      );
    }
  }

  public async setTaskAsInProgressStatus() {
    const t = await this.getTask();
    const list = await ClickUp.getList(t.list.id);
    if (
      list.statuses.find(
        (s) => s.status.toLowerCase() === TaskStatus.DevInProgress
      )
    ) {
      return this.setTaskStatus(TaskStatus.DevInProgress);
    }
    return this.setTaskStatus(TaskStatus.InProgress);
  }

  public async setTaskAsInReviewStatus() {
    const t = await this.getTask();
    const list = await ClickUp.getList(t.list.id);
    if (
      list.statuses.find(
        (s) => s.status.toLowerCase() === TaskStatus.DevInReview
      )
    ) {
      return this.setTaskStatus(TaskStatus.DevInReview);
    }
    if (
      list.statuses.find((s) => s.status.toLowerCase() === TaskStatus.InReview)
    ) {
      return this.setTaskStatus(TaskStatus.InReview);
    }
    return this.setTaskStatus(TaskStatus.Review);
  }

  public static async getGroups() {
    const team = (await ClickUp.getTeams()).teams.find(
      (t) => t.name === CONFIG.ClickUpTeam
    );
    if (!team) {
      console.log('Team does not exist.');
      return;
    }
    return callApi<{ groups: Group[] }>('get', `/group/`, { team_id: team.id });
  }

  public static async getFrontendGroupMembers() {
    return (await this.getGroups())?.groups.find(
      (g) => g.name === 'Frontend Team'
    )?.members;
  }
}
