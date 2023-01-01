import { ClickUp, CONFIG } from '@accel-shooter/node-shared';
import { writeFileSync } from 'fs';
import { Action } from '../classes/action.class';

export class DumpMyTasksAction extends Action {
  public command = 'dumpMyTasks';
  public description = 'dump my tasks to file';
  public async run() {
    const mySummarizedTasks = await ClickUp.getMySummarizedTasks();
    writeFileSync(
      CONFIG.MySummarizedTasksFile,
      JSON.stringify(mySummarizedTasks)
    );
  }
}
