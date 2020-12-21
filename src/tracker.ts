import childProcess from "child_process";
import untildify from "untildify";
import { BaseFileRef } from "./base";
import { ClickUp } from "./clickup";
import { CONFIG } from "./config";
import { GitLab } from "./gitlab";
import {
  getClickUpTaskIdFromGitLabIssue,
  getGitLabProjectConfigByName,
} from "./utils";

export class Tracker extends BaseFileRef {
  protected get path() {
    return untildify(CONFIG.TrackListFile);
  }

  constructor() {
    super();
    this.trackTask();
    setInterval(() => {
      this.trackTask();
    }, 5 * 60 * 1000);
  }

  private getItems() {
    const content = this.readFile();
    const lines = content.split("\n").filter(Boolean);
    const items = lines.map((line) => line.split(" "));
    return items;
  }

  public async trackTask() {
    return Promise.all(
      this.getItems().map(([projectId, issueNumber]) =>
        this.trackSingle(projectId, issueNumber)
      )
    );
  }

  public async trackSingle(projectName: string, issueNumber: string) {
    const projectConfig = getGitLabProjectConfigByName(projectName);
    if (!projectConfig?.deployedStatus && !projectConfig?.stagingStatus) {
      return;
    }
    const gitLab = new GitLab(projectConfig.id);
    const issue = await gitLab.getIssue(issueNumber);
    const clickUpTaskId = getClickUpTaskIdFromGitLabIssue(issue);
    if (!clickUpTaskId) {
      return;
    }
    const clickUp = new ClickUp(clickUpTaskId);
    const mergeRequests = await gitLab.listMergeRequestsWillCloseIssueOnMerge(
      issueNumber
    );
    const mergeRequest = await gitLab.getMergeRequest(
      mergeRequests[mergeRequests.length - 1].iid
    );
    if (projectConfig.stagingStatus && mergeRequest.state === "merged") {
      const clickUpTask = await clickUp.getTask();
      if (clickUpTask.status.status === "in review") {
        childProcess.execSync(
          `osascript -e 'display notification "${projectName} #${issueNumber} is merged!" with title "Accel Shooter"'`
        );
        // await clickUp.setTaskStatus(projectConfig.stagingStatus);
      }
      if (
        projectConfig.deployedStatus &&
        clickUpTask.status.status === "staging"
      ) {
        const commit = await gitLab.getCommit(mergeRequest.merge_commit_sha);
        if (commit.last_pipeline.status === "success") {
          childProcess.execSync(
            `osascript -e 'display notification "${projectName} #${issueNumber} is deployed!" with title "Accel Shooter"'`
          );
          // await clickUp.setTaskStatus(projectConfig.deployedStatus);
        }
      }
    }
  }
}
