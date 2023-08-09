import { CONFIG } from '@accel-shooter/node-shared';
import { Action } from '../classes/action.class';

import { differenceInMilliseconds, parseISO } from 'date-fns';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { TimingApp } from '../classes/timing-app.class';
import { getInfoFromArgument } from '../utils';

export class SetTEAction extends Action {
  public command = 'setTE';
  public description = 'set time estimate for current or specified task';
  public arguments = [
    { name: '[clickUpTaskId]', description: 'optional ClickUp Task Id' },
  ];
  public async run(clickUpTaskIdArg: string) {
    const {
      gitLab,
      mergeRequest,
      clickUp,
      clickUpTask,
      clickUpTaskId,
      gitLabProject,
    } = await getInfoFromArgument(clickUpTaskIdArg);
    const path = join(CONFIG.TaskTimeTrackFolder, `${clickUpTaskId}.csv`);
    let timeEstimate = 0;
    if (existsSync(path)) {
      const content = readFileSync(path, { encoding: 'utf-8' });
      timeEstimate += content
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const cells = line.split(',');
          return differenceInMilliseconds(
            parseISO(cells[1]),
            parseISO(cells[0])
          );
        })
        .reduce((a, b) => a + b);
    }
    timeEstimate += await new TimingApp().getWorkingTimeInTask(
      clickUpTaskId,
      gitLabProject.path
    );
    if (timeEstimate) {
      await clickUp.setTaskTimeEstimate(timeEstimate);
    } else {
      console.warn('Time Estimate is zero!');
    }
  }
}
