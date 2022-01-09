import { ChecklistResponse, Task } from "../models/clickup.models";
import { Comment } from "../models/clickup/comment.models";
import { List } from "../models/clickup/list.models";
import { TaskIncludeSubTasks } from "../models/clickup/task.models";
import { Team } from "../models/clickup/team.models";
import { User } from "../models/clickup/user.models";
import { callApiFactory } from "../utils/api.utils";
const callApi = callApiFactory("ClickUp");

export class ClickUp {
  constructor(public taskId: string) {}

  public static getCurrentUser() {
    return callApi<{ user: User }>("get", `/user/`);
  }

  public static getList(listId: string) {
    return callApi<List>("get", `/list/${listId}`);
  }

  public static getTeams() {
    return callApi<{ teams: Team[] }>("get", `/team/`);
  }

  public static getRTVTasks(teamId: string, userID: number) {
    return callApi<{ tasks: Task[] }>("get", `/team/${teamId}/task/`, {
      statuses: ["ready to verify"],
      include_closed: true,
      assignees: [userID],
    });
  }

  public static getMyTasks(teamId: string, userID: number) {
    return callApi<{ tasks: Task[] }>("get", `/team/${teamId}/task/`, {
      statuses: ["Open", "pending", "ready to do", "in progress"],
      assignees: [userID],
      subtasks: true,
    });
  }

  public getTask() {
    return callApi<Task>("get", `/task/${this.taskId}`);
  }

  public getTaskIncludeSubTasks() {
    return callApi<TaskIncludeSubTasks>("get", `/task/${this.taskId}`, {
      include_subtasks: true,
    });
  }

  public getTaskComments() {
    return callApi<{ comments: Comment[] }>(
      "get",
      `/task/${this.taskId}/comment/`
    ).then((r) => r.comments);
  }

  public setTaskStatus(status: string) {
    return callApi<Task>("put", `/task/${this.taskId}`, null, { status });
  }

  public createChecklist(name: string) {
    return callApi<ChecklistResponse>(
      "post",
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
      "post",
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
      "put",
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
    return callApi<{}>(
      "delete",
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
          .filter((c) => c.type === "frame")
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
}
