import { LockType, SingleInstanceLock } from 'single-instance-lock';
import { Tracker } from '../classes/tracker.class';

const locker = new SingleInstanceLock('accel-shooter');

export async function trackAction() {
  locker.lock(LockType.First);
  locker.on('locked', () => {
    const tracker = new Tracker();
    tracker.startSync();
  });
  locker.on('error', () => {
    console.log('Lock occupied!');
  });
}
