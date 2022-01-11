import { ClickUp, CONFIG, GitLab, Job } from "@accel-shooter/node-shared";
import childProcess from "child_process";
import { compareAsc, parseISO } from "date-fns";
import { appendFileSync } from "fs";
import nodeNotifier from "node-notifier";
import untildify from "untildify";
import { getGitLabProjectConfigByName } from "../utils";
import { BaseFileRef } from "./base-file-ref.class";

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

  public addItem(projectName: string, mergeRequestIId: string | number) {
    appendFileSync(this.path, `\n${projectName} ${mergeRequestIId}`);
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
        const job = jobs.find((j) => j.name === "deploy-staging");
        if (!job) {
          continue;
        }
        this.lastDeployedCommitMap[project.name] = job.commit;
        break;
      }
    }
    return Promise.all(
      this.getItems().map(([projectName, mergeRequestIId]) =>
        this.trackSingle(projectName, mergeRequestIId)
      )
    );
  }

  public async trackSingle(projectName: string, mergeRequestIId: string) {
    const projectConfig = getGitLabProjectConfigByName(projectName);
    if (!projectConfig?.deployedStatus && !projectConfig?.stagingStatus) {
      return;
    }
    const gitLab = new GitLab(projectConfig.id);
    const mergeRequest = await gitLab.getMergeRequest(mergeRequestIId);
    const branchName = mergeRequest.source_branch;
    const match = branchName.match(/CU-([a-z0-9]+)/);
    if (!match) {
      throw Error("Cannot get task number from branch");
    }
    const clickUpTaskId = match[1];
    const clickUp = new ClickUp(clickUpTaskId);
    const clickUpTask = await clickUp.getTask();
    if (
      ["closed", "verified", "ready to verify", "done"].includes(
        clickUpTask.status.status.toLowerCase()
      )
    ) {
      this.closeItem(projectName, mergeRequestIId);
      return;
    }
    if (projectConfig.stagingStatus && mergeRequest.state === "merged") {
      if (clickUpTask.status.status === "in review") {
        const list = await ClickUp.getList(clickUpTask.list.id);
        let stagingStatus =
          projectConfig.stagingStatus[list.name] ||
          projectConfig.stagingStatus["*"];
        if (
          list.statuses.find((s) => s.status.toLowerCase() === stagingStatus)
        ) {
          await clickUp.setTaskStatus(stagingStatus);
        } else {
          stagingStatus = "done";
          await clickUp.setTaskStatus(stagingStatus);
        }
        if (stagingStatus === "verified") {
          this.closeItem(projectName, mergeRequestIId);
        }
        const message = `${projectName} !${mergeRequestIId}: In Review -> ${stagingStatus}`;
        childProcess.execSync(
          `osascript -e 'display notification "${message}" with title "Accel Shooter"'`
        );
        console.log(message);
        if (!projectConfig.deployedStatus) {
          this.closeItem(projectName, mergeRequestIId);
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
          this.closeItem(projectName, mergeRequestIId);
          const message = `${projectName} !${mergeRequestIId} (Under List ${list.name}): Staging -> ${deployedStatus}`;
          nodeNotifier.notify({
            title: "Accel Shooter",
            message,
          });
          console.log(message);
        }
      }
    }
  }

  public closeItem(projectName: string, mergeRequestIId: string) {
    const content = this.readFile();
    const lines = content
      .split("\n")
      .filter(Boolean)
      .filter((line) => line !== `${projectName} ${mergeRequestIId}`);
    this.writeFile(lines.join("\n"));
  }
}
