import { ClickUp } from "@accel-shooter/node-shared";
import { CustomProgressLog } from "../classes/progress-log.class";
import { getClickUpTaskIdFromGitLabIssue, getGitLabFromArgv } from "../utils";

export async function revertEndAction() {
  const { gitLab, issueNumber } = getGitLabFromArgv();
  const p = new CustomProgressLog("End", [
    "Get GitLab Issue",
    "Get GitLab Merge Request",
    "Update GitLab Merge Request Ready Status and Assignee",
    "Update ClickUp Task Status",
  ]);
  p.start();
  const issue = await gitLab.getIssue(issueNumber);
  p.next();
  const mergeRequests = await gitLab.listMergeRequestsWillCloseIssueOnMerge(
    issueNumber
  );
  const mergeRequest = mergeRequests[mergeRequests.length - 1];
  p.next();
  await gitLab.markMergeRequestAsUnreadyAndSetAssigneeToSelf(mergeRequest);
  p.next();
  const clickUpTaskId = getClickUpTaskIdFromGitLabIssue(issue);
  if (clickUpTaskId) {
    const clickUp = new ClickUp(clickUpTaskId);
    await clickUp.setTaskStatus("in progress");
  }
  p.end(0);
}
