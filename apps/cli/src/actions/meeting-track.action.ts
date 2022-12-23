import { Google } from '@accel-shooter/node-shared';
import { CronJob } from 'cron';
import { add, format, isBefore, parseISO } from 'date-fns';
import open from 'open';
import { displayNotification, getDayFromArgv } from '../utils';

export async function meetingTrackAction() {
  // get today meetings
  const day = getDayFromArgv();
  const g = new Google();
  const todayMeetings = await g.listAttendingEvent(
    day.toISOString(),
    add(day, { days: 1 }).toISOString()
  );
  if (todayMeetings.length === 0) {
    console.log('No meetings today!');
  }
  // print today meetings and times and meeting link
  for (const m of todayMeetings) {
    console.log(`- ${format(parseISO(m.start.dateTime), 'Pp')}: ${m.summary}`);
  }
  // setup cron job for opening meeting link
  todayMeetings.forEach((m) => {
    const openTime = add(parseISO(m.start.dateTime), { minutes: -5 });
    if (isBefore(openTime, day)) {
      return;
    }
    const job = new CronJob(openTime, () => {
      displayNotification(
        `${m.summary} at ${format(parseISO(m.start.dateTime), 'Pp')}`
      );
      open(m.hangoutLink + '?authuser=1');
    });
    job.start();
  });
}
