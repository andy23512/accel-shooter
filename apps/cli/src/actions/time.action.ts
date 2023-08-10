import clipboardy from 'clipboardy';
import { format } from 'date-fns';
import { Action } from '../classes/action.class';

export class TimeAction extends Action {
  public command = 'time';
  public description = 'copy current time';
  public alias = 'ti';
  public async run() {
    clipboardy.writeSync(format(new Date(), 'yyyyMMdd_HHmmss'));
    console.log('Copied!');
  }
}
