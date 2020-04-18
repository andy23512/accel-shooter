import { callApiFactory } from './utils';
const callApi = callApiFactory('ClickUp');

export function getClickUpTask(clickUpTaskId: string) {
  return callApi('get', `/task/${clickUpTaskId}`);
}

export function setClickUpTaskStatus(clickUpTaskId: string, status: string) {
  return callApi('put', `/task/${clickUpTaskId}`, { status });
}
