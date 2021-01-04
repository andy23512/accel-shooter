import childProcess from "child_process";
import { appendFileSync } from "fs";
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

  public startSync() {
    this.trackTask();
    setInterval(() => {
      this.trackTask();
    }, 60 * 1000);
  }

  public addItem(projectName: string, issueNumber: string | number) {
    appendFileSync(this.path, `\n${projectName} ${issueNumber}`);
  }

  private getItems() {
    const content = this.readFile();
    const lines = content
      .split("\n")
      .filter(Boolean)
      .filter((line) => !line.startsWith("#"));
    const items = lines.map((line) => line.split(" "));
    return items;
  }

  public async trackTask() {
    console.log(`[Track] ${new Date().toLocaleString()}`);
    return Promise.all(
      this.getItems().map(([projectName, issueNumber]) =>
        this.trackSingle(projectName, issueNumber)
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
        await clickUp.setTaskStatus(projectConfig.stagingStatus);
        const message = `${projectName} #${issueNumber}: In Review -> ${projectConfig.stagingStatus}`;
        childProcess.execSync(
          `osascript -e 'display notification "${message}" with title "Accel Shooter"'`
        );
        console.log(message);
        if (!projectConfig.deployedStatus) {
          this.closeItem(projectName, issueNumber);
        }
      }
      if (
        projectConfig.deployedStatus &&
        clickUpTask.status.status === "staging"
      ) {
        const pipelines = await gitLab.listPipelines(
          mergeRequest.merge_commit_sha,
          "develop"
        );
        if (pipelines.length === 0) {
          return;
        }
        const pipeline = pipelines[0];
        const jobs = await gitLab.listPipelineJobs(pipeline.id);
        if (
          pipeline.status === "success" &&
          jobs.find((j) => j.name === "deploy" && j.status === "success")
        ) {
          const message = `${projectName} #${issueNumber}: Staging -> ${projectConfig.deployedStatus}`;
          childProcess.execSync(
            `osascript -e 'display notification "${message}" with title "Accel Shooter"'`
          );
          console.log(message);
          await clickUp.setTaskStatus(projectConfig.deployedStatus);
          this.closeItem(projectName, issueNumber);
        }
        if (pipeline.status === "failed") {
          const message = `${projectName} #${issueNumber}: Pipeline failed`;
          childProcess.execSync(
            `osascript -e 'display notification "${message}" with title "Accel Shooter"'`
          );
          console.log(message);
        }
      }
    }
  }

  public closeItem(projectName: string, issueNumber: string) {
    const content = this.readFile();
    const lines = content
      .split("\n")
      .filter(Boolean)
      .filter((line) => line !== `${projectName} ${issueNumber}`);
    this.writeFile(lines.join("\n"));
  }
}
