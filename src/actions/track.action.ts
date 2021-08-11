import instanceLocker from "instance-locker";
import { Tracker } from "../classes/tracker.class";
const locker = instanceLocker("accel-shooter track");

export async function trackAction() {
  const success = await locker.Lock();
  if (success) {
    const tracker = new Tracker();
    tracker.startSync();
  } else {
    console.log("Lock occupied!");
  }
}
