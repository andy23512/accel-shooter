import { CONFIG, DateFormat, formatDate } from '@accel-shooter/node-shared';
import { parseISO, startOfDay } from 'date-fns';
import { readFileSync } from 'fs';
import path from 'path';
import runAppleScript from 'run-applescript';
import {
  RawTimingAppRecord,
  TimingAppRecord,
} from '../models/timing-app-record.models';
import { Holiday } from './holiday.class';
import { TaskProgressTracker } from './task-progress-tracker.class';

export class TimingApp {
  public async getWorkingTimeInTask(
    clickUpTaskId: string,
    gitLabProjectPath: string
  ) {
    const content = new TaskProgressTracker().readFile();
    const taskProgressTimeEntries = content
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const col = line.split(',');
        return [col[0], parseISO(col[1]), parseISO(col[2])] as const;
      })
      .filter(([taskId]) => taskId === clickUpTaskId);
    const startFetchDate = startOfDay(taskProgressTimeEntries[0][1]);
    const endFetchDate = startOfDay(
      taskProgressTimeEntries[taskProgressTimeEntries.length - 1][2]
    );
    const records = await this.getRecords(startFetchDate, endFetchDate);
    const holiday = new Holiday();
    const workingRecords = records
      .filter(({ startDate, endDate }) => {
        return taskProgressTimeEntries.some(
          (e) =>
            (e[1] <= startDate && e[2] >= startDate) ||
            (e[1] <= endDate && e[2] >= endDate)
        );
      })
      .filter((r) => {
        return (
          r.application === 'iTerm2' ||
          ((r.application === 'Brave Browser' ||
            r.application === 'Google Chrome' ||
            r.application === 'Microsoft Edge') &&
            (r.path?.includes('localhost') ||
              r.path?.includes('app.clickup.com') ||
              r.path?.includes('github.com') ||
              r.path?.includes('figma.com') ||
              r.path?.includes('gitlab.com'))) ||
          r.project === 'Development' ||
          (r.application === 'Code - Insiders' &&
            r.path?.includes(gitLabProjectPath))
        );
      });
    return workingRecords.reduce((acc, cur) => acc + cur.duration, 0) * 1000;
  }

  public async getRecords(
    startDate: Date,
    endDate: Date
  ): Promise<TimingAppRecord[]> {
    const exportPath = path.join(
      CONFIG.TimingAppExportFolder,
      `${formatDate(startDate, DateFormat.GITLAB)}_${formatDate(
        endDate,
        DateFormat.GITLAB
      )}.json`
    );
    const script = readFileSync(
      path.resolve(__dirname, './assets/timing-app-export.applescript'),
      { encoding: 'utf-8' }
    )
      .replace(/START_DATE/g, formatDate(startDate, DateFormat.TIMING_APP))
      .replace(/END_DATE/g, formatDate(endDate, DateFormat.TIMING_APP))
      .replace(/EXPORT_PATH/g, exportPath);
    await runAppleScript(script);
    const records: RawTimingAppRecord[] = JSON.parse(
      readFileSync(exportPath, { encoding: 'utf-8' })
    );
    return records.map((r) => ({
      ...r,
      startDate: parseISO(r.startDate),
      endDate: parseISO(r.endDate),
    }));
  }
}
