import { ClickUp } from "@accel-shooter/node-shared";
import { CustomProgressLog } from "../classes/progress-log.class";
import {
  getClickUpTaskIdFromGitLabIssue,
  getGitLabFromArgv,
  normalizeGitLabIssueChecklist,
  openUrlsInTabGroup,
} from "../utils";

export async function endAction() {
  const { gitLab, issueNumber } = getGitLabFromArgv();
  const p = new CustomProgressLog("End", [
    "Get GitLab Issue",
    "Get GitLab Merge Request",
    "Update GitLab Merge Request Ready Status and Assignee",
    "Update ClickUp Task Status",
    "Close Tab Group",
  ]);
  p.start();
  const issue = await gitLab.getIssue(issueNumber);
  const gitLabChecklistText = issue.description
    .replace(/https:\/\/app.clickup.com\/t\/\w+/g, "")
    .trim();
  const gitLabNormalizedChecklist =
    normalizeGitLabIssueChecklist(gitLabChecklistText);
  const fullCompleted = gitLabNormalizedChecklist.every((item) => item.checked);
  if (!fullCompleted) {
    console.log("This task has uncompleted todo(s).");
    process.exit();
  }
  p.next();
  const mergeRequests = await gitLab.listMergeRequestsWillCloseIssueOnMerge(
    issueNumber
  );
  const mergeRequest = mergeRequests[mergeRequests.length - 1];
  p.next();
  await gitLab.markMergeRequestAsReadyAndAddAssignee(mergeRequest);
  p.next();
  const clickUpTaskId = getClickUpTaskIdFromGitLabIssue(issue);
  if (clickUpTaskId) {
    const clickUp = new ClickUp(clickUpTaskId);
    await clickUp.setTaskStatus("in review");
  }
  p.next();
  openUrlsInTabGroup([], issueNumber);
  p.end(0);
}
