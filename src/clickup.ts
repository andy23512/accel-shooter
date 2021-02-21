import { ChecklistResponse, Task } from './models/clickup.models';
import { callApiFactory } from './utils';
const callApi = callApiFactory('ClickUp');

export class ClickUp {
  constructor(public taskId: string) {}

  public getTask() {
    return callApi<Task>('get', `/task/${this.taskId}`);
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
    return callApi<{}>(
      'delete',
      `/checklist/${checklistId}/checklist_item/${checklistItemId}`
    );
  }
}
