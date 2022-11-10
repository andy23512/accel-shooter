import fs from 'fs/promises';

import { ClickUp, GitLab } from '@accel-shooter/node-shared';

import { checkAction } from './actions/check.action';
import { closeAction } from './actions/close.action';
import { commitAction } from './actions/commit.action';
import { copyAction } from './actions/copy.action';
import { crossChecklistAction } from './actions/cross-checklist.action';
import { dumpMyTasksAction } from './actions/dump-my-tasks.action';
import { endAction } from './actions/end.action';
import { fetchHolidayAction } from './actions/fetch-holiday.action';
import { listAction } from './actions/list.action';
import { openAction } from './actions/open.action';
import { revertEndAction } from './actions/revert-end.action';
import { RTVTasksAction } from './actions/rtv-tasks.action';
import { showDiffAction } from './actions/show-diff.action';
import { startAction } from './actions/start.action';
import { switchAction } from './actions/switch.action';
import { timeAction } from './actions/time.action';
import { toDoAction } from './actions/to-do.action';
import { trackAction } from './actions/track.action';
import { updateAction } from './actions/update.action';
import { watchPipelineAction } from './actions/watch-pipeline.action';
import { workAction } from './actions/work.action';

const actions: { [key: string]: () => Promise<void> } = {
  start: startAction,
  open: openAction,
  switch: switchAction,
  update: updateAction,
  track: trackAction,
  end: endAction,
  revertEnd: revertEndAction,
  crossChecklist: crossChecklistAction,
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
  test: async () => {
    const itemListJson = await fs.readFile('./dp-analysis', 'utf-8');
    const itemList = JSON.parse(itemListJson);
    const outputItem: any[] = [];
    for (const item of itemList) {
      const taskId = item.url.match(/https:\/\/app.clickup.com\/t\/(\w+)/)[1];
      const clickUp = new ClickUp(taskId);
      const task = await clickUp.getTask();
      const spaceName = (await ClickUp.getSpace(task.space.id)).name;
      const gitLabInfo = await clickUp.getGitLabProjectAndMergeRequestIId();
      let mergeRequestLink = null;
      if (gitLabInfo) {
        const { gitLabProject, mergeRequestIId } = gitLabInfo;
        const gitLab = new GitLab(gitLabProject.id);
        const mergeRequest = await gitLab.getMergeRequest(mergeRequestIId);
        mergeRequestLink = mergeRequest.web_url;
      }
      outputItem.push({
        ...item,
        spaceName,
        mergeRequestLink,
      });
    }
    await fs.writeFile(
      './output-final.json',
      JSON.stringify(outputItem, null, 2)
    );
  },
};

(async () => {
  const action = process.argv[2];
  if (actions[action]) {
    await actions[action]();
  } else {
    throw Error(`Action ${action} is not supported.`);
  }
})();
