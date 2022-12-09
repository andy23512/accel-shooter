import { execSync } from 'child_process';
import { add, format, parse } from 'date-fns';

import {
  ClickUp,
  getTaskIdFromBranchName,
  GitLab,
  Google,
} from '@accel-shooter/node-shared';

import { DailyProgress } from '../classes/daily-progress.class';
import { Holiday } from '../classes/holiday.class';
import { CustomProgressLog } from '../classes/progress-log.class';
import { Todo } from '../classes/todo.class';

export async function dailyProgressAction() {
  const p = new CustomProgressLog('Daily Progress', [
    'Get Date',
    'Get Pushed Events',
    'Get Progressed Tasks',
    'Get Todo Task',
    'Get Processing Tasks',
    'Get Reviewed Merge Requests',
    'Get Meetings',
    'Add Day Progress Entry',
    'Copy Day Progress into Clipboard',
  ]);
  p.start(); // Get Date
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
  console.log('Previous work day:', format(previousWorkDay, 'yyyy-MM-dd'));
  p.next(); // Get Pushed Events
  const after = format(add(previousWorkDay, { days: -1 }), 'yyyy-MM-dd');
  const before = format(day, 'yyyy-MM-dd');
  const pushedEvents = await GitLab.getPushedEvents(after, before);
  const pushedToEvents = pushedEvents.filter(
    (e) => e.action_name === 'pushed to'
  );
  const modifiedBranches = [
    ...new Set(pushedToEvents.map((e) => e.push_data.ref)),
  ];
  p.next(); // Get Progressed Tasks
  let result = [];
  for (const b of modifiedBranches) {
    const taskId = getTaskIdFromBranchName(b);
    if (taskId) {
      const clickUp = new ClickUp(getTaskIdFromBranchName(b));
      result.push('    ' + (await clickUp.getTaskString('dp')));
    }
  }
  p.next(); // Get Todo Task
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
  p.next(); // Get Processing Tasks
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
  if (result2.length === 0) {
    console.log('Todo of today is empty!');
    process.exit();
  }
  result = [...new Set(result)];
  result2 = [...new Set(result2)];
  p.next(); // Get Reviewed Merge Requests
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
  p.next(); // Get Meetings
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
  p.next(); // Add Day Progress Entry
  const dayDp = `### ${format(
    day,
    'yyyy/MM/dd'
  )}\n1. Previous Day\n${result.join('\n')}\n2. Today\n${result2.join(
    '\n'
  )}\n3. No blockers so far`;
  new DailyProgress().addDayProgress(dayDp);

  p.next(); // Copy Day Progress into Clipboard
  let resultRecord = dayDp;
  resultRecord = resultRecord
    .replace(
      /\* (\([A-Za-z0-9 %]+\)) \[(.*?)\]\((https:\/\/app.clickup.com\/t\/\w+)\).*/g,
      '* $1 <a href="$3">$2</a>'
    )
    .replace(
      /\* \[(.*?)\]\((https:\/\/gitlab\.com.*?)\)/g,
      '* <a href="$2">$1</a>'
    )
    .replace(/ {2}-/g, '&nbsp;&nbsp;-')
    .replace(/ {8}\*/g, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*')
    .replace(/ {4}\*/g, '&nbsp;&nbsp;&nbsp;&nbsp;*')
    .replace(/\n/g, '<br/>')
    .replace(/'/g, '');
  execSync(`
  echo '${resultRecord}' |\
  hexdump -ve '1/1 "%.2x"' |\
  xargs printf "set the clipboard to {text:\\\" \\\", «class HTML»:«data HTML%s»}" |\
  osascript -
  `);
  p.end(0);
}
