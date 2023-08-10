import { Action } from '../classes/action.class';

import { getInfoFromArgument } from '../utils';

export class StartReviewAction extends Action {
  public command = 'startReview';
  public description = 'start review current or specified task';
  public alias = 'sr';
  public arguments = [
    { name: '[clickUpTaskId]', description: 'optional ClickUp Task Id' },
  ];
  public async run(clickUpTaskIdArg: string) {
    const { clickUp } = await getInfoFromArgument(clickUpTaskIdArg);
    await clickUp.setTaskAsInReviewStatus();
  }
}
