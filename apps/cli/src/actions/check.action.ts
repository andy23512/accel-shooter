import { Action } from '../classes/action.class';
import { Checker } from '../classes/checker.class';
import { getInfoFromArgument } from '../utils';

export class CheckAction extends Action {
  public command = 'check';
  public description = 'do automate checking for current or specified task';
  public alias = 'c';
  public arguments = [
    { name: '[clickUpTaskId]', description: 'optional ClickUp Task Id' },
  ];
  public options = [
    {
      flags: '-s, --select',
      description: 'show select menu for selecting check items to run',
    },
  ];
  public async run(clickUpTaskIdArg: string, { select }: { select: boolean }) {
    const { gitLabProject, mergeRequestIId } = await getInfoFromArgument(
      clickUpTaskIdArg
    );
    const checker = new Checker(gitLabProject, mergeRequestIId, select);
    await checker.start();
  }
}
