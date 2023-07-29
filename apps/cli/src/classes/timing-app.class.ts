import { CONFIG, DateFormat, formatDate } from '@accel-shooter/node-shared';
import { parseISO, startOfDay } from 'date-fns';
import { readFileSync } from 'fs';
import path, { join } from 'path';
import runAppleScript from 'run-applescript';
import { TimingAppRecord } from '../models/timing-app-record.models';

export class TimingApp {
  public async getWorkingTimeInTask(
    clickUpTaskId: string,
    gitLabProjectPath: string
  ) {
    const taskProgressTimeFile = join(
      CONFIG.TaskInProgressTimesFolder,
      `${clickUpTaskId}.csv`
    );
    const taskProgressTimeEntries = readFileSync(taskProgressTimeFile, {
      encoding: 'utf-8',
    })
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const col = line.split(',');
        return [parseISO(col[0]), parseISO(col[1])];
      });
    const startDate = startOfDay(taskProgressTimeEntries[0][0]);
    const endDate = startOfDay(
      taskProgressTimeEntries[taskProgressTimeEntries.length - 1][1]
    );
    const records = await this.getRecords(startDate, endDate);
    const workingRecords = records
      .filter((r) => {
        const start = parseISO(r.startDate);
        const end = parseISO(r.endDate);
        return taskProgressTimeEntries.some(
          (e) =>
            (e[0] <= start && e[1] >= start) || (e[0] <= end && e[1] >= end)
        );
      })
      .filter(
        (r) =>
          (r.application === 'Code - Insiders' &&
            r.path?.includes(gitLabProjectPath)) ||
          r.application === 'iTerm2' ||
          (r.application === 'Brave Browser' &&
            (r.path?.includes('localhost:') ||
              r.path?.includes('npm.io') ||
              r.path?.includes('npmjs.com') ||
              r.path?.includes('gitlab.com'))) ||
          r.project === 'Development'
      );
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
    const records: TimingAppRecord[] = JSON.parse(
      readFileSync(exportPath, { encoding: 'utf-8' })
    );
    return records;
  }
}
