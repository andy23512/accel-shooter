import { Action } from '../classes/action.class';
import { CustomProgressLog } from '../classes/progress-log.class';
import { Todo } from '../classes/todo.class';
import { Tracker } from '../classes/tracker.class';
import { getInfoFromArgument, openUrlsInTabGroup } from '../utils';

export class CloseAction extends Action {
  public command = 'close';
  public description = 'close current or specified task';
  public arguments = [
    { name: '[clickUpTaskId]', description: 'optional ClickUp Task Id' },
  ];
  public async run(clickUpTaskIdArg: string) {
    const { gitLab, mergeRequest, clickUp, clickUpTaskId } =
      await getInfoFromArgument(clickUpTaskIdArg);
    const p = new CustomProgressLog('Close', [
      'Close GitLab Merge Request',
      'Update ClickUp Task Status',
      'Close Tab Group',
      'Remove Todo',
      'Remove Track Item',
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
    p.next(); // Remove Track Item
    new Tracker().closeItem(clickUpTaskId);
    p.end(0);
  }
}
