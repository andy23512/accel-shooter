import { ClickUp } from "@accel-shooter/node-shared";
import {
  getClickUpTaskIdFromGitLabIssue,
  getGitLabFromArgv,
  openUrlsInTabGroup,
} from "../utils";

export async function openAction() {
  const { gitLab, issueNumber } = getGitLabFromArgv();
  const issue = await gitLab.getIssue(issueNumber);
  const mergeRequests = await gitLab.listMergeRequestsWillCloseIssueOnMerge(
    issueNumber
  );
  const clickUpTaskId = getClickUpTaskIdFromGitLabIssue(issue);
  if (clickUpTaskId) {
    const clickUp = new ClickUp(clickUpTaskId);
    const clickUpTask = await clickUp.getTask();
    const frameUrls = await clickUp.getFrameUrls();
    const urls = [
      issue.web_url,
      mergeRequests[mergeRequests.length - 1].web_url,
      clickUpTask.url,
    ];
    if (frameUrls.length) {
      urls.push(frameUrls[0]);
    }
    openUrlsInTabGroup(urls, issueNumber);
  }
}
