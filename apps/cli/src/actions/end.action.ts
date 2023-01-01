import { normalizeClickUpChecklist } from '@accel-shooter/node-shared';
import { Action } from '../classes/action.class';

import { CustomProgressLog } from '../classes/progress-log.class';
import { Todo } from '../classes/todo.class';
import { getInfoFromArgument, openUrlsInTabGroup } from '../utils';

export class EndAction extends Action {
  public command = 'end';
  public description = 'end current or specified task';
  public arguments = [
    { name: '[clickUpTaskId]', description: 'optional ClickUp Task Id' },
  ];
  public async run(clickUpTaskIdArg: string) {
    const { gitLab, mergeRequest, clickUp, clickUpTask, clickUpTaskId } =
      await getInfoFromArgument(clickUpTaskIdArg);
    const p = new CustomProgressLog('End', [
      'Check Task is Completed or not',
      'Update GitLab Merge Request Ready Status and Assignee',
      'Update ClickUp Task Status',
      'Close Tab Group',
      'Remove Todo',
    ]);
    p.next(); // Check Task is Completed or not
    const targetChecklist = clickUpTask.checklists.find((c) =>
      c.name.toLowerCase().includes('synced checklist')
    );
    const clickUpNormalizedChecklist = normalizeClickUpChecklist(
      targetChecklist.items
    );
    const fullCompleted = clickUpNormalizedChecklist.every(
      (item) => item.checked
    );
    if (!fullCompleted) {
      console.log('This task has uncompleted todo(s).');
      process.exit();
    }
    p.next(); // Update GitLab Merge Request Ready Status and Assignee
    await gitLab.markMergeRequestAsReadyAndAddAssignee(mergeRequest);
    p.next(); // Update ClickUp Task Status
    try {
      await clickUp.setTaskStatus('in review');
    } catch {
      await clickUp.setTaskStatus('review');
    }
    p.next(); // Close Tab Group
    openUrlsInTabGroup([], clickUpTaskId);
    p.next(); // Remove Todo
    const todo = new Todo();
    todo.removeTodo(clickUpTaskId);
    p.end(0);
    console.log('Merge Request URL: ' + mergeRequest.web_url);
  }
}
