import { ChecklistResponse, Task } from "./models/clickup.models";
import { List } from "./models/clickup/list.models";
import { Team } from "./models/clickup/team.models";
import { User } from "./models/clickup/user.models";
import { callApiFactory } from "./utils";
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
}
