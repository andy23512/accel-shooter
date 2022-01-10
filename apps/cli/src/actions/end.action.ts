import { normalizeClickUpChecklist } from "@accel-shooter/node-shared";
import { CustomProgressLog } from "../classes/progress-log.class";
import { getInfoFromArgv, openUrlsInTabGroup } from "../utils";

export async function endAction() {
  const { gitLab, mergeRequest, clickUp, clickUpTask, clickUpTaskId } =
    await getInfoFromArgv();
  const p = new CustomProgressLog("End", [
    "Check Task is Completed or not",
    "Update GitLab Merge Request Ready Status and Assignee",
    "Update ClickUp Task Status",
    "Close Tab Group",
  ]);
  p.next(); // Check Task is Completed or not
  const targetChecklist = clickUpTask.checklists.find((c) =>
    c.name.toLowerCase().includes("synced checklist")
  );
  const clickUpNormalizedChecklist = normalizeClickUpChecklist(
    targetChecklist.items
  );
  const fullCompleted = clickUpNormalizedChecklist.every(
    (item) => item.checked
  );
  if (!fullCompleted) {
    console.log("This task has uncompleted todo(s).");
    process.exit();
  }
  p.next(); // Update GitLab Merge Request Ready Status and Assignee
  await gitLab.markMergeRequestAsReadyAndAddAssignee(mergeRequest);
  p.next(); // Update ClickUp Task Status
  await clickUp.setTaskStatus("in review");
  p.next(); // Close Tab Group
  openUrlsInTabGroup([], clickUpTaskId);
  p.end(0);
}
