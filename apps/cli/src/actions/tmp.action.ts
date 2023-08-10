import { Action } from '../classes/action.class';

export class TmpAction extends Action {
  public command = 'tmp';
  public description = 'temporary action for development testing';
  public alias = 't';

  public async run() {
    console.log('tmp action works!');
  }
}
