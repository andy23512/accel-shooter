import { ClickUp, formatDate } from '@accel-shooter/node-shared';
import clipboardy from 'clipboardy';
import { add, compareAsc, endOfDay, startOfDay } from 'date-fns';
import { groupBy, prop } from 'ramda';
import { Action } from '../classes/action.class';
import { DailyProgress } from '../classes/daily-progress.class';
import { Holiday } from '../classes/holiday.class';
import { getDayFromArgument } from '../utils';

export class WeeklyProgressAction extends Action {
  public command = 'weeklyProgress';
  public description =
    'generate weekly progress report and copy it to clipboard';
  public arguments = [
    { name: '[startDay]', description: 'optional start day of date range' },
  ];
  public async run(startDayArg: string) {
    const today = startOfDay(new Date());
    const startDay = startOfDay(
      getDayFromArgument(startDayArg, add(today, { weeks: -1 }))
    );
    const range = [add(startDay, { days: -1 }), add(today, { days: -1 })];
    let tempDay = new Date(range[1].valueOf());
    const holiday = new Holiday();
    const workDaysInRange: Date[] = [];
    while (compareAsc(range[0], tempDay) < 0) {
      if (holiday.checkIsWorkday(tempDay)) {
        workDaysInRange.push(tempDay);
      }
      tempDay = add(tempDay, { days: -1 });
    }
    const dpContent = new DailyProgress().readFile();
    const data: Record<string, Item> = {};
    for (const d of workDaysInRange) {
      const nextWorkDay = formatDate(holiday.getNextWorkday(d));
      const dString = formatDate(d);
      const matchResult = dpContent.match(
        new RegExp(
          `### ${nextWorkDay}\n1\\. Previous Day\n(.*?)\n2\\. Today`,
          's'
        )
      );
      if (matchResult) {
        const record = matchResult[1];
        const lines = record.split('\n').filter(Boolean);
        for (const line of lines) {
          const matchItem = line.match(
            /(\([A-Za-z0-9 %]+\)) \[(.*?)\]\((https:\/\/app.clickup.com\/t\/(\w+))\)/
          );
          if (matchItem) {
            const name = matchItem[2];
            const url = matchItem[3];
            const taskId = matchItem[4];
            if (data[url]) {
              data[url].days.push(dString);
            } else {
              const { gitLabProject } = await new ClickUp(
                taskId
              ).getGitLabProjectAndMergeRequestIId();
              data[url] = {
                url,
                name,
                project: gitLabProject.name,
                days: [dString],
              };
            }
          }
        }
      } else {
        console.log('No Result!');
      }
    }
    const finalData = Object.values(data).map((item) => ({
      ...item,
      startDay: item.days[item.days.length - 1],
      endDay: item.days[0],
    }));
    finalData.sort((a, b) => a.endDay.localeCompare(b.endDay));
    const groupedRecords = groupBy(prop('project'), finalData);
    const previousWorkDayOfToday = holiday.getPreviousWorkday(today);
    let result = `## ${formatDate(startDay)}~${formatDate(
      previousWorkDayOfToday
    )}`;
    Object.entries(groupedRecords).forEach(([project, records]) => {
      result += `\n### ${project}`;
      records.forEach(({ name, url, startDay, endDay }) => {
        if (startDay === endDay) {
          result += `\n- ${startDay} [${name}](${url})`;
        } else {
          result += `\n- ${startDay}~${subtractCommon(
            endDay,
            startDay
          )} [${name}](${url})`;
        }
      });
    });
    clipboardy.writeSync(result);
    console.log('Copied!');
  }
}

function subtractCommon(a: string, b: string) {
  const ar = a.split('/');
  const br = b.split('/');
  let i = 0;
  while (i < ar.length && ar[i] === br[i]) {
    i++;
  }
  return ar.slice(i).join('/');
}
interface Item {
  url: string;
  name: string;
  days: string[];
  project: string;
}
