import { biWeeklyProgressAction } from './actions/bi-weekly-progress.action';
import { checkAction } from './actions/check.action';
import { closeAction } from './actions/close.action';
import { commitAction } from './actions/commit.action';
import { copyAction } from './actions/copy.action';
import { dailyProgressAction } from './actions/daily-progress.action';
import { dumpMyTasksAction } from './actions/dump-my-tasks.action';
import { endAction } from './actions/end.action';
import { fetchHolidayAction } from './actions/fetch-holiday.action';
import { listDCAction } from './actions/list-dc.action';
import { listAction } from './actions/list.action';
import { meetingTrackAction } from './actions/meeting-track.action';
import { openAction } from './actions/open.action';
import { revertEndAction } from './actions/revert-end.action';
import { routineAction } from './actions/routine.action';
import { RTVTasksAction } from './actions/rtv-tasks.action';
import { showDiffAction } from './actions/show-diff.action';
import { startAction } from './actions/start.action';
import { switchAction } from './actions/switch.action';
import { timeAction } from './actions/time.action';
import { toDoAction } from './actions/to-do.action';
import { trackAction } from './actions/track.action';
import { watchPipelineAction } from './actions/watch-pipeline.action';
import { workAction } from './actions/work.action';

const actions: { [key: string]: () => Promise<void> } = {
  start: startAction,
  open: openAction,
  switch: switchAction,
  dailyProgress: dailyProgressAction,
  track: trackAction,
  end: endAction,
  revertEnd: revertEndAction,
  RTVTasks: RTVTasksAction,
  check: checkAction,
  dumpMyTasks: dumpMyTasksAction,
  list: listAction,
  toDo: toDoAction,
  copy: copyAction,
  showDiff: showDiffAction,
  time: timeAction,
  fetchHoliday: fetchHolidayAction,
  watchPipeline: watchPipelineAction,
  commit: commitAction,
  close: closeAction,
  work: workAction,
  routine: routineAction,
  biWeeklyProgress: biWeeklyProgressAction,
  listDC: listDCAction,
  meetingTrack: meetingTrackAction,
};

(async () => {
  const action = process.argv[2];
  if (actions[action]) {
    await actions[action]();
  } else {
    throw Error(`Action ${action} is not supported.`);
  }
})();
