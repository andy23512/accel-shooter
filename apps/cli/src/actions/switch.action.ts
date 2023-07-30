import { execSync } from 'child_process';
import os from 'os';
import { configReadline } from '../actions';
import { Action } from '../classes/action.class';
import { TaskProgressTracker } from '../classes/task-progress-tracker.class';
import {
  checkWorkingTreeClean,
  getInfoFromArgument,
  promiseSpawn,
} from '../utils';
import { OpenAction } from './open.action';

export class SwitchAction extends Action {
  public command = 'switch';
  public description = 'switch to a task';
  public arguments = [
    { name: '[clickUpTaskId]', description: 'optional ClickUp Task Id' },
  ];
  public async run(clickUpTaskIdArg: string) {
    configReadline();
    const { gitLabProject, mergeRequest, clickUpTaskId } =
      await getInfoFromArgument(clickUpTaskIdArg);
    if (mergeRequest.state === 'merged') {
      console.log('This task is completed.');
      return;
    }
    process.chdir(gitLabProject.path.replace('~', os.homedir()));
    const branchName = execSync('git branch --show-current', {
      encoding: 'utf-8',
    });
    if (branchName.trim() !== mergeRequest.source_branch) {
      const isClean = await checkWorkingTreeClean();
      if (!isClean) {
        console.log(
          '\nWorking tree is not clean or something is not pushed. Aborted.'
        );
        process.exit();
      }
      await new TaskProgressTracker().setTime(clickUpTaskId, 'start');
      await promiseSpawn(
        'git',
        ['checkout', mergeRequest.source_branch],
        'pipe'
      );
      await new OpenAction().run(clickUpTaskId);
    }
  }
}
