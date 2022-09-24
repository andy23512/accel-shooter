import { normalizeClickUpChecklist } from '@accel-shooter/node-shared';
import { CustomProgressLog } from '../classes/progress-log.class';
import { Todo } from '../classes/todo.class';
import { getInfoFromArgv, openUrlsInTabGroup } from '../utils';

export async function endAction() {
  const { gitLab, mergeRequest, clickUp, clickUpTask, clickUpTaskId } =
    await getInfoFromArgv();
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
  await clickUp.setTaskStatus('in review');
  p.next(); // Close Tab Group
  openUrlsInTabGroup([], clickUpTaskId);
  p.next(); // Remove Todo
  const todo = new Todo();
  const todoContent = todo.readFile();
  const matchResult = todoContent.match(/## Todos\n([\s\S]+)## Processing/);
  if (matchResult) {
    const todoList = matchResult[1].split('\n');
    const newTodoList = todoList.filter((t) => t && !t.includes(clickUpTaskId));
    const newTodoContent = todoContent.replace(
      matchResult[1],
      newTodoList.map((str) => str + '\n').join('')
    );
    todo.writeFile(newTodoContent);
  } else {
    throw Error('Todo File Broken');
  }
  p.end(0);
}
