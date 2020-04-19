import { callApiFactory } from './utils';
const callApi = callApiFactory('ClickUp');

export class ClickUp {
  constructor(public taskId: string) {}

  public getTask() {
    return callApi('get', `/task/${this.taskId}`);
  }

  public setTaskStatus(status: string) {
    return callApi('put', `/task/${this.taskId}`, { status });
  }
}
