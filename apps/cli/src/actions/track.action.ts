import { LockType, SingleInstanceLock } from 'single-instance-lock';
import { Action } from '../classes/action.class';
import { Tracker } from '../classes/tracker.class';

const locker = new SingleInstanceLock('accel-shooter');

export class TrackAction extends Action {
  public command = 'track';
  public description =
    'track for merge request merge status and then change ClickUp task status';
  public async run() {
    locker.lock(LockType.First);
    locker.on('locked', () => {
      const tracker = new Tracker();
      tracker.startSync();
    });
    locker.on('error', () => {
      console.log('Lock occupied!');
    });
  }
}
