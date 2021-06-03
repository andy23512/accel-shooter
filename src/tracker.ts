import childProcess from "child_process";
import { compareAsc, parseISO } from "date-fns";
import { appendFileSync } from "fs";
import nodeNotifier from "node-notifier";
import untildify from "untildify";
import { BaseFileRef } from "./base";
import { ClickUp } from "./clickup";
import { CONFIG } from "./config";
import { GitLab } from "./gitlab";
import { Job } from "./models/gitlab/job.models";
import {
  getClickUpTaskIdFromGitLabIssue,
  getGitLabProjectConfigByName,
} from "./utils";

export class Tracker extends BaseFileRef {
  public lastDeployedCommitMap: Record<string, Job["commit"]> = {};
  protected get path() {
    return untildify(CONFIG.TrackListFile);
  }

  public startSync() {
    this.trackTask();
    setInterval(() => {
      this.trackTask();
    }, CONFIG.TrackIntervalInMinutes * 60 * 1000);
  }

  public addItem(projectName: string, issueNumber: string | number) {
    appendFileSync(this.path, `\n${projectName} ${issueNumber}`);
  }

  public getItems() {
    const content = this.readFile();
    const lines = content
      .split("\n")
      .filter(Boolean)
      .filter((line) => !line.startsWith("#"));
    const items = lines.map((line) => line.split(" "));
    return items;
  }

  public async trackTask() {
    console.log(`[TrackNew] ${new Date().toLocaleString()}`);
    const checkDeployProjects = CONFIG.GitLabProjects.filter(
      (p) => !!p.deployedStatus
    );
    for (const project of checkDeployProjects) {
      const gitLab = new GitLab(project.id);
      const successPipelines = await gitLab.listPipelines({
        status: "success",
        per_page: 100,
      });
      // get last commit with success pipeline with deploy job
      for (const pipeline of successPipelines) {
        const jobs = await gitLab.listPipelineJobs(pipeline.id);
        const job = jobs.find((j) => j.name === "deploy-latest");
        if (!job) {
          continue;
        }
        this.lastDeployedCommitMap[project.name] = job.commit;
        break;
      }
    }
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
        const list = await ClickUp.getList(clickUpTask.list.id);
        const stagingStatus =
          projectConfig.stagingStatus[list.name] ||
          projectConfig.stagingStatus["*"];
        await clickUp.setTaskStatus(stagingStatus);
        if (stagingStatus === "verified") {
          this.closeItem(projectName, issueNumber);
        }
        const message = `${projectName} #${issueNumber}: In Review -> ${stagingStatus}`;
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
        clickUpTask.status.status === "staging" &&
        this.lastDeployedCommitMap[projectName]
      ) {
        const commit = await gitLab.getCommit(mergeRequest.merge_commit_sha);
        const deployedCommitDate = parseISO(
          this.lastDeployedCommitMap[projectName].created_at
        );
        const mergeCommitDate = parseISO(commit.created_at);
        const compareTime = compareAsc(deployedCommitDate, mergeCommitDate);
        if (compareTime === 1 || compareTime === 0) {
          const list = await ClickUp.getList(clickUpTask.list.id);
          const deployedStatus =
            projectConfig.deployedStatus[list.name] ||
            projectConfig.deployedStatus["*"];
          await clickUp.setTaskStatus(deployedStatus);
          this.closeItem(projectName, issueNumber);
          const message = `${projectName} #${issueNumber} (Under List ${list.name}): Staging -> ${deployedStatus}`;
          nodeNotifier.notify({
            title: "Accel Shooter",
            message,
          });
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
