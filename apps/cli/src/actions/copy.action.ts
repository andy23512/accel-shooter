import { ClickUp } from "@accel-shooter/node-shared";
import clipboardy from "clipboardy";
import { getClickUpTaskIdFromGitLabIssue, getGitLabFromArgv } from "../utils";

export async function copyAction() {
  const { gitLab, issueNumber, gitLabProject } = getGitLabFromArgv();
  const issue = await gitLab.getIssue(issueNumber);
  const clickUpTaskId = getClickUpTaskIdFromGitLabIssue(issue);
  if (clickUpTaskId) {
    const clickUp = new ClickUp(clickUpTaskId);
    const task = await clickUp.getTask();
    const string = `[${issue.title}](${task.url}) [${gitLabProject.name} ${issueNumber}](${issue.web_url})`;
    clipboardy.writeSync(string);
    console.log("Copied!");
  }
}
