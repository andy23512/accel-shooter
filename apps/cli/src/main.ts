import { program } from 'commander';
import { CheckAction } from './actions/check.action';
import { CloseAction } from './actions/close.action';
import { CommitAction } from './actions/commit.action';
import { CopyAction } from './actions/copy.action';
import { DailyProgressAction } from './actions/daily-progress.action';
import { DumpMyTasksAction } from './actions/dump-my-tasks.action';
import { EndAction } from './actions/end.action';
import { FetchHolidayAction } from './actions/fetch-holiday.action';
import { GenAction } from './actions/gen.action';
import { ListDCAction } from './actions/list-dc.action';
import { ListAction } from './actions/list.action';
import { MeetingTrackAction } from './actions/meeting-track.action';
import { OpenAction } from './actions/open.action';
import { RevertEndAction } from './actions/revert-end.action';
import { RoutineAction } from './actions/routine.action';
import { RTVTasksAction } from './actions/rtv-tasks.action';
import { ShowDiffAction } from './actions/show-diff.action';
import { StartReviewAction } from './actions/start-review.action';
import { StartAction } from './actions/start.action';
import { SwitchAction } from './actions/switch.action';
import { TimeAction } from './actions/time.action';
import { TodoAction } from './actions/to-do.action';
import { TrackAction } from './actions/track.action';
import { WatchPipelineAction } from './actions/watch-pipeline.action';
import { WeeklyProgressAction } from './actions/weekly-progress.action';
import { WorkAction } from './actions/work.action';
import { Action } from './classes/action.class';

const ACTIONS: Action[] = [
  new CheckAction(),
  new CloseAction(),
  new CommitAction(),
  new CopyAction(),
  new DailyProgressAction(),
  new DumpMyTasksAction(),
  new EndAction(),
  new FetchHolidayAction(),
  new GenAction(),
  new ListDCAction(),
  new ListAction(),
  new MeetingTrackAction(),
  new OpenAction(),
  new RevertEndAction(),
  new RoutineAction(),
  new RTVTasksAction(),
  new ShowDiffAction(),
  new StartAction(),
  new StartReviewAction(),
  new SwitchAction(),
  new TimeAction(),
  new TodoAction(),
  new TrackAction(),
  new WatchPipelineAction(),
  new WeeklyProgressAction(),
  new WorkAction(),
];

(async () => {
  program.name('accel-shooter').description('CLI for automating some works');
  ACTIONS.forEach((action) => {
    action.init(program);
  });
  program.parseAsync();
})();
