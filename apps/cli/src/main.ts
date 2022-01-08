import { checkAction } from "./actions/check.action";
import { commentAction } from "./actions/comment.action";
import { copyAction } from "./actions/copy.action";
import { crossChecklistAction } from "./actions/cross-checklist.action";
import { endAction } from "./actions/end.action";
import { listAction } from "./actions/list.action";
import { myTasksAction } from "./actions/my-tasks.action";
import { openAction } from "./actions/open.action";
import { revertEndAction } from "./actions/revert-end.action";
import { RTVTasksAction } from "./actions/rtv-tasks.action";
import { showDiffAction } from "./actions/show-diff.action";
import { startAction } from "./actions/start.action";
import { syncAction } from "./actions/sync.action";
import { timeAction } from "./actions/time.action";
import { toDoAction } from "./actions/to-do.action";
import { trackAction } from "./actions/track.action";
import { updateAction } from "./actions/update.action";

const actions: { [key: string]: () => Promise<void> } = {
  start: startAction,
  open: openAction,
  sync: syncAction,
  update: updateAction,
  track: trackAction,
  end: endAction,
  revertEnd: revertEndAction,
  crossChecklist: crossChecklistAction,
  RTVTasks: RTVTasksAction,
  check: checkAction,
  comment: commentAction,
  myTasks: myTasksAction,
  list: listAction,
  toDo: toDoAction,
  time: timeAction,
  copy: copyAction,
  showDiff: showDiffAction,
};

(async () => {
  const action = process.argv[2];
  if (actions[action]) {
    await actions[action]();
  } else {
    throw Error(`Action ${action} is not supported.`);
  }
})();
