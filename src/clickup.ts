import { callApiFactory } from './utils';
const callApi = callApiFactory('ClickUp');

export class ClickUp {
  constructor(public taskId: string) {}

  public getTask() {
    return callApi('get', `/task/${this.taskId}`);
  }

  public getTaskWithSubTasks() {
    return callApi('get', `/task/${this.taskId}?subtasks=true`);
  }

  public setTaskStatus(status: string) {
    return callApi('put', `/task/${this.taskId}`, { status });
  }
}
