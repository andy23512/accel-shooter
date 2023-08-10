import { Action } from '../classes/action.class';
import { getInfoFromArgument, openUrlsInTabGroup } from '../utils';

export class OpenAction extends Action {
  public command = 'open';
  public description = 'open task todo page of current or specified task';
  public alias = 'o';
  public arguments = [
    { name: '[clickUpTaskId]', description: 'optional ClickUp Task Id' },
  ];
  public async run(clickUpTaskIdArg: string) {
    const { clickUpTaskId } = await getInfoFromArgument(clickUpTaskIdArg);
    const urls = [`localhost:8112/task/${clickUpTaskId}`];
    openUrlsInTabGroup(urls, clickUpTaskId);
  }
}
