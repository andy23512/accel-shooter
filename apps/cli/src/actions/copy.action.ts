import clipboardy from 'clipboardy';
import { Action } from '../classes/action.class';

import { getInfoFromArgument } from '../utils';

export class CopyAction extends Action {
  public command = 'copy';
  public description = 'copy a task in todo string format';
  public arguments = [
    { name: '[clickUpTaskId]', description: 'optional ClickUp Task Id' },
  ];
  public async run(clickUpTaskIdArg: string) {
    const { clickUp } = await getInfoFromArgument(clickUpTaskIdArg, true);
    const string = await clickUp.getTaskString('todo');
    clipboardy.writeSync(string);
    console.log('Copied!');
  }
}
