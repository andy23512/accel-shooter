import { add, format, parse } from 'date-fns';

import { ClickUp, getTaskIdFromBranchName, GitLab, Google } from '@accel-shooter/node-shared';

import { DailyProgress } from '../classes/daily-progress.class';
import { Holiday } from '../classes/holiday.class';
import { Todo } from '../classes/todo.class';

export async function updateAction() {
  const today = new Date();
  const day =
    process.argv.length >= 4
      ? parse(process.argv[3], 'yyyy/MM/dd', today)
      : today;
  let previousDay = add(day, { days: -1 });
  const holiday = new Holiday();
  while (!holiday.checkIsWorkday(format(previousDay, 'yyyy/M/d'))) {
    previousDay = add(previousDay, { days: -1 });
  }
  const previousWorkDay = previousDay;
  console.log('Previous work day: ', format(previousWorkDay, 'yyyy-MM-dd'));
  const after = format(add(previousWorkDay, { days: -1 }), 'yyyy-MM-dd');
  const before = format(day, 'yyyy-MM-dd');
  const pushedEvents = await GitLab.getPushedEvents(after, before);
  const pushedToEvents = pushedEvents.filter(
    (e) => e.action_name === 'pushed to'
  );
  const modifiedBranches = [
    ...new Set(pushedToEvents.map((e) => e.push_data.ref)),
  ];
  let result = [];
  for (const b of modifiedBranches) {
    const taskId = getTaskIdFromBranchName(b);
    if (taskId) {
      const clickUp = new ClickUp(getTaskIdFromBranchName(b));
      result.push('    ' + (await clickUp.getTaskString('dp')));
    }
  }
  let result2 = [];
  const todo = new Todo();
  const todoContent = todo.readFile();
  let matchResult = todoContent.match(/## Todos\n([\s\S]+)\n##/);
  if (matchResult) {
    const todoList = matchResult[1].split('\n');
    const firstTodo = todoList[0];
    matchResult = firstTodo.match(/https:\/\/app.clickup.com\/t\/(\w+)\)/);
    if (matchResult) {
      const taskId = matchResult[1];
      const clickUp = new ClickUp(taskId);
      const taskString = await clickUp.getTaskString('dp');
      result2.push('    ' + taskString);
    } else {
      result2.push('    ' + firstTodo.replace('- [ ]', '*'));
    }
  } else {
    throw Error('Todo File Broken');
  }
  matchResult = todoContent.match(/## Processing\n([\s\S]+)\n##/);
  if (matchResult) {
    const processingList = matchResult[1].split('\n');
    const firstProcessingItem = processingList[0];
    matchResult = firstProcessingItem.match(
      /https:\/\/app.clickup.com\/t\/(\w+)\)/
    );
    if (matchResult) {
      const taskId = matchResult[1];
      const clickUp = new ClickUp(taskId);
      const taskString = await clickUp.getTaskString('dp');
      result.push('    ' + taskString);
      result2.push('    ' + (await clickUp.getTaskString('dp')));
    } else if (firstProcessingItem.includes('- [ ]')) {
      result.push('    ' + firstProcessingItem.replace('- [ ]', '*'));
      result2.push('    ' + firstProcessingItem.replace('- [ ]', '*'));
    }
  }
  result = [...new Set(result)];
  result2 = [...new Set(result2)];
  const approvedEvents = await GitLab.getApprovedEvents(after, before);
  if (approvedEvents.length > 0) {
    result.push('    * Review');
    for (const approvedEvent of approvedEvents) {
      const projectId = approvedEvent.project_id;
      const mergeRequestIId = approvedEvent.target_iid;
      const gitLab = new GitLab(projectId.toString());
      const mergeRequest = await gitLab.getMergeRequest(mergeRequestIId);
      result.push(`        * [${mergeRequest.title}](${mergeRequest.web_url})`);
    }
  }
  const g = new Google();
  const previousDayMeeting = await g.listAttendingEvent(
    previousWorkDay.toISOString(),
    day.toISOString()
  );
  const todayMeeting = await g.listAttendingEvent(
    day.toISOString(),
    add(day, { days: 1 }).toISOString()
  );
  if (previousDayMeeting.length > 0) {
    result.push('    * Meeting');
    for (const m of previousDayMeeting) {
      result.push(`        * ${m.summary}`);
    }
  }
  if (todayMeeting.length > 0) {
    result2.push('    * Meeting');
    for (const m of todayMeeting) {
      result2.push(`        * ${m.summary}`);
    }
  }
  const dayDp = `### ${format(
    day,
    'yyyy/MM/dd'
  )}\n1. Previous Day\n${result.join('\n')}\n2. Today\n${result2.join(
    '\n'
  )}\n3. No blockers so far`;
  new DailyProgress().addDayProgress(dayDp);
}
