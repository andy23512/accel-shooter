import { CustomProgressLog } from "../classes/progress-log.class";
import { getInfoFromArgv } from "../utils";

export async function revertEndAction() {
  const { gitLab, mergeRequest, clickUp } = await getInfoFromArgv();
  const p = new CustomProgressLog("End", [
    "Update GitLab Merge Request Ready Status and Assignee",
    "Update ClickUp Task Status",
  ]);
  p.start();
  await gitLab.markMergeRequestAsUnreadyAndSetAssigneeToSelf(mergeRequest);
  p.next();
  await clickUp.setTaskStatus("in progress");
  p.end(0);
}
