import { Tracker } from "../classes/tracker.class";

export async function trackAction() {
  const tracker = new Tracker();
  tracker.startSync();
}
