import { execSync } from 'child_process';
import os from 'os';
import { Action } from '../classes/action.class';
import { TaskProgressTracker } from '../classes/task-progress-tracker.class';
import { getInfoFromArgument } from '../utils';

export class PauseAction extends Action {
  public command = 'pause';
  public description = 'pause a task (record end time in progress tracker)';
  public arguments = [
    { name: '[clickUpTaskId]', description: 'optional ClickUp Task Id' },
  ];
  public async run(clickUpTaskIdArg: string) {
    const { clickUpTaskId, gitLabProject, gitLab } = await getInfoFromArgument(
      clickUpTaskIdArg
    );
    new TaskProgressTracker().setTime(clickUpTaskId, 'end');
    const defaultBranch = await gitLab.getDefaultBranchName();
    process.chdir(gitLabProject.path.replace('~', os.homedir()));
    execSync(`git checkout ${defaultBranch}`);
  }
}
