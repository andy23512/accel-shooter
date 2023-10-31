import fs from 'fs';

import { CONFIG, formatDate } from '@accel-shooter/node-shared';

import readline from 'readline';
import { Action } from '../classes/action.class';
import { Holiday } from '../classes/holiday.class';
import { getDayFromArgument, openUrlsInTabGroup, promiseSpawn } from '../utils';
import { DailyProgressAction } from './daily-progress.action';
import { DumpMyTasksAction } from './dump-my-tasks.action';

export function confirm(question: string) {
  return new Promise<void>((resolve, reject) => {
    const prompt = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    prompt.question(question + ' (Enter or y or n) ', function (answer) {
      if (answer === 'y' || answer === 'Y' || answer === '') {
        prompt.close();
        resolve();
      } else {
        reject();
      }
    });
  });
}

export class RoutineAction extends Action {
  public command = 'routine';
  public description = 'daily routine list';
  public alias = 'ro';
  public arguments = [{ name: '[day]', description: 'optional day' }];
  public options = [
    { flags: '-s, --skip-punch', description: 'skip punch item' },
  ];
  public async run(dayArg: string, { skipPunch }: { skipPunch: boolean }) {
    const day = getDayFromArgument(dayArg);
    const hour = day.getHours();
    const isMorning = hour < 12;
    const holiday = new Holiday();
    const isWorkDay = holiday.checkIsWorkday(day);
    const message = isWorkDay ? 'Today is workday!' : 'Today is holiday!';
    console.log(message);
    if (isWorkDay && !skipPunch) {
      const { url } = JSON.parse(
        fs.readFileSync(CONFIG.PunchInfoFile, { encoding: 'utf-8' })
      );
      open(url);
      await confirm('punch done (manual)?');
    }
    if (isMorning) {
      if (isWorkDay) {
        await confirm('run dump my tasks?');
        await new DumpMyTasksAction().run();
        openUrlsInTabGroup(
          ['localhost:8112/tasks', 'localhost:8112/markdown/todo'],
          'accel'
        );
        await confirm('check tasks and todo done?');
        await confirm('run daily progress?');
        await new DailyProgressAction().run(formatDate(day));
        await promiseSpawn('open', ['-a', 'Slack']);
        await confirm('send dp to slack done?');
      }
    }
    console.log('Complete');
  }
}
