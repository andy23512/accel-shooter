import open from "open";
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
import { startAction } from "./actions/start.action";
import { syncAction } from "./actions/sync.action";
import { trackAction } from "./actions/track.action";
import { CONFIG } from "./config";

const actionAlias: { [key: string]: string } = {
  st: "start",
  o: "open",
  sy: "sync",
  c: "copy",
  t: "track",
  e: "end",
  re: "revertEnd",
  ls: "list",
};

const actions: { [key: string]: () => Promise<any> } = {
  start: startAction,
  open: openAction,
  sync: syncAction,
  copy: copyAction,
  track: trackAction,
  end: endAction,
  revertEnd: revertEndAction,
  crossChecklist: crossChecklistAction,
  RTVTasks: RTVTasksAction,
  check: checkAction,
  comment: commentAction,
  myTasks: myTasksAction,
  list: listAction,
};

(async () => {
  const action = actionAlias[process.argv[2]] || process.argv[2];
  if (actions[action]) {
    await actions[action]();
  } else if (CONFIG.WebPageAlias[action]) {
    open(CONFIG.WebPageAlias[action]);
  } else {
    throw Error(`Action ${action} is not supported.`);
  }
})();
