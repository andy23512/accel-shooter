import { Action } from '../classes/action.class';
import { getInfoFromArgument } from '../utils';

export class ListAction extends Action {
  public command = 'list';
  public description = 'show current or specified task name';
  public arguments = [
    { name: '[clickUpTaskId]', description: 'optional ClickUp Task Id' },
  ];
  public async run(clickUpTaskIdArg: string) {
    const { clickUp } = await getInfoFromArgument(clickUpTaskIdArg);
    console.log(await clickUp.getFullTaskName());
  }
}
