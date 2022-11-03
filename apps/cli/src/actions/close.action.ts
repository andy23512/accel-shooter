import { CustomProgressLog } from '../classes/progress-log.class';
import { Todo } from '../classes/todo.class';
import { getInfoFromArgv, openUrlsInTabGroup } from '../utils';

export async function closeAction() {
  const { gitLab, mergeRequest, clickUp, clickUpTaskId } =
    await getInfoFromArgv();
  const p = new CustomProgressLog('Close', [
    'Close GitLab Merge Request',
    'Update ClickUp Task Status',
    'Close Tab Group',
    'Remove Todo',
  ]);
  p.next(); // Close GitLab Merge Request
  await gitLab.closeMergeRequest(mergeRequest);
  p.next(); // Update ClickUp Task Status
  await clickUp.setTaskStatus('suspended');
  p.next(); // Close Tab Group
  openUrlsInTabGroup([], clickUpTaskId);
  p.next(); // Remove Todo
  const todo = new Todo();
  todo.removeTodo(clickUpTaskId);
  p.end(0);
}
