import { CONFIG, normalizeClickUpChecklist } from '@accel-shooter/node-shared';
import { Action } from '../classes/action.class';

import { differenceInMilliseconds, parseISO } from 'date-fns';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { CustomProgressLog } from '../classes/progress-log.class';
import { TimingApp } from '../classes/timing-app.class';
import { Todo } from '../classes/todo.class';
import { getInfoFromArgument, openUrlsInTabGroup } from '../utils';
import { PauseAction } from './pause.action';

export class EndAction extends Action {
  public command = 'end';
  public description = 'end current or specified task';
  public alias = 'e';
  public arguments = [
    { name: '[clickUpTaskId]', description: 'optional ClickUp Task Id' },
  ];
  public async run(clickUpTaskIdArg: string) {
    const {
      gitLab,
      mergeRequest,
      clickUp,
      clickUpTask,
      clickUpTaskId,
      gitLabProject,
    } = await getInfoFromArgument(clickUpTaskIdArg);
    const p = new CustomProgressLog('End', [
      'Check Task is Completed or not',
      'Pause Task',
      'Update GitLab Merge Request Ready Status and Assignee',
      'Update ClickUp Task Status',
      'Set ClickUp Task Time Estimate',
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
    p.next(); // Pause Task
    await new PauseAction().run(clickUpTaskId);
    p.next(); // Update GitLab Merge Request Ready Status and Assignee
    await gitLab.markMergeRequestAsReadyAndAddAssignee(mergeRequest);
    p.next(); // Update ClickUp Task Status
    await clickUp.setTaskAsInReviewStatus();
    p.next(); // Set ClickUp Task Time Estimate
    const path = join(CONFIG.TaskTimeTrackFolder, `${clickUpTaskId}.csv`);
    let timeEstimate = 0;
    if (existsSync(path)) {
      const content = readFileSync(path, { encoding: 'utf-8' });
      timeEstimate += content
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const cells = line.split(',');
          return differenceInMilliseconds(
            parseISO(cells[1]),
            parseISO(cells[0])
          );
        })
        .reduce((a, b) => a + b);
    }
    timeEstimate += await new TimingApp().getWorkingTimeInTask(
      clickUpTaskId,
      gitLabProject.path
    );
    if (timeEstimate) {
      await clickUp.setTaskTimeEstimate(timeEstimate);
    } else {
      console.warn('Time Estimate is zero!');
    }
    p.next(); // Close Tab Group
    openUrlsInTabGroup([], clickUpTaskId);
    p.next(); // Remove Todo
    const todo = new Todo();
    todo.removeTodo(clickUpTaskId);
    p.end(0);
    console.log('Merge Request URL: ' + mergeRequest.web_url);
    console.log('Task URL: ' + clickUpTask.url);
  }
}
