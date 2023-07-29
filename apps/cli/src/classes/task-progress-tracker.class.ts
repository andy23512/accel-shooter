import { CONFIG } from '@accel-shooter/node-shared';
import { appendFileSync } from 'fs';
import { join } from 'path';

export class TaskProgressTracker {
  get filePath() {
    const folderPath = CONFIG.TaskInProgressTimesFolder;
    return join(folderPath, this.taskId + '.csv');
  }

  constructor(private taskId: string) {}

  public setTime(type: 'start' | 'end') {
    const time = new Date().toISOString();
    const addedContent = type === 'start' ? `\n${time},` : time;
    appendFileSync(this.filePath, addedContent, { encoding: 'utf-8' });
  }
}
