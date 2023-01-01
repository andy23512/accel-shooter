import { Action } from '../classes/action.class';
import { CustomProgressLog } from '../classes/progress-log.class';
import { getInfoFromArgument } from '../utils';

export class RevertEndAction extends Action {
  public command = 'revertEnd';
  public description = 'revert end state of a task';
  public arguments = [
    { name: '[clickUpTaskId]', description: 'optional ClickUp Task Id' },
  ];
  public async run(clickUpTaskIdArg: string) {
    const { gitLab, mergeRequest, clickUp } = await getInfoFromArgument(
      clickUpTaskIdArg
    );
    const p = new CustomProgressLog('End', [
      'Update GitLab Merge Request Ready Status and Assignee',
      'Update ClickUp Task Status',
    ]);
    p.start();
    await gitLab.markMergeRequestAsUnreadyAndSetAssigneeToSelf(mergeRequest);
    p.next();
    await clickUp.setTaskStatus('in progress');
    p.end(0);
  }
}
