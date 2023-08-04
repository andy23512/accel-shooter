import { CONFIG } from '@accel-shooter/node-shared';
import { PauseAction } from '../actions/pause.action';
import { BaseFileRef } from './base-file-ref.class';

export class TaskProgressTracker extends BaseFileRef {
  get path() {
    return CONFIG.TaskInProgressTimeTable;
  }

  public async setTime(taskId: string, type: 'start' | 'end') {
    const content = this.readFile().trim();
    const lines = content.split('\n').filter(Boolean);
    const lastRowCols = lines[lines.length - 1].split(',');
    const lastTaskId = lastRowCols[0];
    const lastTaskEndTime = lastRowCols[2];
    let addedContent = '';
    if (type === 'start') {
      if (lastTaskEndTime === '') {
        if (lastTaskId === taskId) {
          return;
        }
        await new PauseAction().run(lastTaskId);
      }
      addedContent += `\n${taskId},${new Date().toISOString()},`;
    } else {
      if (lastTaskEndTime === '') {
        if (lastTaskId === taskId) {
          addedContent = new Date().toISOString();
        } else {
          throw Error('Task ID mismatch.');
        }
      } else {
        throw Error('Task is not started.');
      }
    }
    console.log('addedContent: ', addedContent);
    this.writeFile(content + addedContent);
  }
}
