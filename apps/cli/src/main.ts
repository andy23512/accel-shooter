import { checkAction } from './actions/check.action';
import { commentAction } from './actions/comment.action';
import { crossChecklistAction } from './actions/cross-checklist.action';
import { endAction } from './actions/end.action';
import { listAction } from './actions/list.action';
import { myTasksAction } from './actions/my-tasks.action';
import { openAction } from './actions/open.action';
import { revertEndAction } from './actions/revert-end.action';
import { RTVTasksAction } from './actions/rtv-tasks.action';
import { startAction } from './actions/start.action';
import { syncAction } from './actions/sync.action';
import { timeAction } from './actions/time.action';
import { toDoAction } from './actions/to-do.action';
import { trackAction } from './actions/track.action';
import { updateAction } from './actions/update.action';
import { GitLab } from './classes/gitlab.class';

const actions: { [key: string]: () => Promise<any> } = {
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
  test: async () => {
    const targets = [
      ['phe-button', 'pheButton'],
      ['btnType', 'pheButtonType'],
      ['btnSize', 'pheButtonSize'],
      ['iconName', 'pheButtonIconName'],
      ['iconSize', 'pheButtonIconSize'],
      ['highlight', 'pheButtonHighlight'],
      ['responsive', 'pheButtonResponsive'],
      ['phe-dialog-close', 'pheDialogClose'],
      ['phe-dialog-content', 'pheDialogContent'],
      ['phe-dialog-title', 'pheDialogTitle'],
      ['pheType', 'type'],
      ['pheSize', 'size'],
      ['pheColor', 'color'],
      ['pheIconSize', 'iconSize'],
      ['pheIconName', 'iconName'],
      ['phePosition', 'position'],
      ['phe-popover', 'phePopover'],
      ['PheCdkOverlayMenuModule', 'PheCdkOverlayModule'],
      ['@aether/pheno/cdk-overlay-menu', '@aether/pheno/cdk-overlay'],
      ['PheCdkOverlayCascadeMenuService', 'PheCdkOverlayCascadeHelperService'],
      ['PheCdkMenuTriggerForDirective', 'PheCdkOverlayTriggerForDirective'],
      ['PheCdkOverlayMenuComponent', 'PheCdkOverlayComponent'],
      ['pheCdkMenuTriggerFor', 'pheCdkOverlayTriggerFor'],
      ['cdkMenuConfig', 'pheCdkOverlayTriggerForConfig'],
      ['CdkMenuConfig', 'CdkOverlayConfig'],
      ['isOpen', 'pheCdkOverlayTriggerForIsOpen'],
      ['IsOpenChange', 'pheCdkOverlayTriggerForIsOpenChange'],
      ['PositionType', 'PheCdkOverlayPositionType'],
      ['PositionMap', 'PheCdkOverlayPositionMap'],
      ['positionPair', 'pheCdkOverlayPositionPair'],
    ];
    const projectIds = [
      'DYSK_Labs%2Fwebsite',
      'DYSK_Labs%2Fspace',
      'DYSK_Labs%2Faether-mono',
      // 'DYSK_Labs%2Fpath-gateway',
      // 'DYSK_Labs%2Fhema-emulator',
    ];
    for (const projectId of projectIds) {
      const gitLab = new GitLab(projectId);
      // get open merge requests
      const openedMergedRequests = await gitLab.getOpenedMergeRequests();
      for (const mergeRequest of openedMergedRequests) {
        console.log(projectId);
        console.log(mergeRequest.iid);
        const mergeRequestChanges = await gitLab.getMergeRequestChanges(
          mergeRequest.iid
        );
        const changes = mergeRequestChanges.changes;
        for (const change of changes) {
          const addDiff = change.diff
            .split('\n')
            .filter((line) => line.startsWith('+'));
          addDiff.forEach((line) => {
            for (const t of targets) {
              if (line.toLowerCase().includes(t[0].toLowerCase())) {
                console.log(change.new_path);
                console.log(line);
              }
            }
          });
        }
      }
    }
    console.log('end');
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
