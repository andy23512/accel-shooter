import { callApiFactory } from './utils';
import { Task, ChecklistResponse } from './models/clickup.models';
const callApi = callApiFactory('ClickUp');

export class ClickUp {
  constructor(public taskId: string) {}

  public getTask() {
    return callApi<Task>('get', `/task/${this.taskId}`);
  }

  public setTaskStatus(status: string) {
    return callApi<Task>('put', `/task/${this.taskId}`, { status });
  }

  public createCheckList(name: string) {
    return callApi<ChecklistResponse>(
      'post',
      `/task/${this.taskId}/checklist`,
      { name }
    );
  }

  public createCheckListItem(
    checklistId: string,
    name: string,
    orderindex: string
  ) {
    return callApi<ChecklistResponse>(
      'post',
      `/checklist/${checklistId}/checklist_item`,
      {
        name,
        orderindex,
      }
    );
  }
}
