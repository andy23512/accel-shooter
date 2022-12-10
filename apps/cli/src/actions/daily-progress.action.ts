import { execSync } from 'child_process';
import { add } from 'date-fns';

import {
  ClickUp,
  formatDate,
  getTaskIdFromBranchName,
  GitLab,
  Google,
} from '@accel-shooter/node-shared';

import { DailyProgress } from '../classes/daily-progress.class';
import { Holiday } from '../classes/holiday.class';
import { CustomProgressLog } from '../classes/progress-log.class';
import { Todo } from '../classes/todo.class';
import { getDayFromArgv } from '../utils';

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
  const day = getDayFromArgv();
  const holiday = new Holiday();
  const previousWorkDay = holiday.getPreviousWorkday(day);
  console.log('Previous work day:', formatDate(previousWorkDay));
  p.next(); // Get Pushed Events
  const after = add(previousWorkDay, { days: -1 });
  const before = day;
  const pushedToEvents = (await GitLab.getPushedEvents(after, before)).filter(
    (e) => e.action_name === 'pushed to'
  );
  const modifiedBranches = [
    ...new Set(pushedToEvents.map((e) => e.push_data.ref)),
  ];
  p.next(); // Get Progressed Tasks
  let previousDayItems: string[] = [];
  for (const b of modifiedBranches) {
    const taskId = getTaskIdFromBranchName(b);
    if (taskId) {
      previousDayItems.push(
        '    ' + (await new ClickUp(taskId).getTaskString('dp'))
      );
    }
  }
  p.next(); // Get Todo Task
  let todayItems: string[] = [];
  const todo = new Todo();
  const todoContent = todo.readFile();
  let matchResult = todoContent.match(/## Todo\n([\s\S]+)\n##/);
  if (matchResult) {
    const todoList = matchResult[1].split('\n');
    const firstTodo = todoList[0];
    matchResult = firstTodo.match(/https:\/\/app.clickup.com\/t\/(\w+)\)/);
    if (matchResult) {
      const taskId = matchResult[1];
      const clickUp = new ClickUp(taskId);
      const taskString = await clickUp.getTaskString('dp');
      todayItems.push('    ' + taskString);
    } else {
      todayItems.push('    ' + firstTodo.replace('- [ ]', '*'));
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
      previousDayItems.push('    ' + taskString);
      todayItems.push('    ' + (await clickUp.getTaskString('dp')));
    } else if (firstProcessingItem.includes('- [ ]')) {
      previousDayItems.push('    ' + firstProcessingItem.replace('- [ ]', '*'));
      todayItems.push('    ' + firstProcessingItem.replace('- [ ]', '*'));
    }
  }
  if (todayItems.length === 0) {
    console.log('Todo of today is empty!');
    process.exit();
  }
  previousDayItems = [...new Set(previousDayItems)];
  todayItems = [...new Set(todayItems)];
  p.next(); // Get Reviewed Merge Requests
  const approvedEvents = await GitLab.getApprovedEvents(after, before);
  if (approvedEvents.length > 0) {
    previousDayItems.push('    * Review');
    for (const approvedEvent of approvedEvents) {
      const projectId = approvedEvent.project_id;
      const mergeRequestIId = approvedEvent.target_iid;
      const gitLab = new GitLab(projectId.toString());
      const mergeRequest = await gitLab.getMergeRequest(mergeRequestIId);
      previousDayItems.push(
        `        * [${mergeRequest.title}](${mergeRequest.web_url})`
      );
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
    previousDayItems.push('    * Meeting');
    for (const m of previousDayMeeting) {
      previousDayItems.push(`        * ${m.summary}`);
    }
  }
  if (todayMeeting.length > 0) {
    todayItems.push('    * Meeting');
    for (const m of todayMeeting) {
      todayItems.push(`        * ${m.summary}`);
    }
  }
  p.next(); // Add Day Progress Entry
  const dayDp = `### ${formatDate(
    day
  )}\n1. Previous Day\n${previousDayItems.join(
    '\n'
  )}\n2. Today\n${todayItems.join('\n')}\n3. No blockers so far`;
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
