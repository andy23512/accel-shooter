import {
  ClickUp,
  CONFIG,
  GitLab,
  TaskStatus,
  titleCase,
} from '@accel-shooter/node-shared';
import { appendFileSync } from 'fs';
import untildify from 'untildify';
import { displayNotification } from '../utils';
import { BaseFileRef } from './base-file-ref.class';

export class Tracker extends BaseFileRef {
  protected get path() {
    return untildify(CONFIG.TrackListFile);
  }

  public startSync() {
    this.trackTask();
    setInterval(() => {
      this.trackTask();
    }, CONFIG.TrackIntervalInMinutes * 60 * 1000);
  }

  public addItem(clickUpTaskId: string) {
    appendFileSync(this.path, `\n${clickUpTaskId}`);
  }

  public getItems() {
    const content = this.readFile();
    return content
      .split('\n')
      .filter(Boolean)
      .filter((line) => !line.startsWith('#'));
  }

  public async trackTask() {
    console.log(`[TrackNew] ${new Date().toLocaleString()}`);
    return Promise.all(
      this.getItems().map((clickUpTaskId) => this.trackSingle(clickUpTaskId))
    );
  }

  public async trackSingle(clickUpTaskId: string) {
    const clickUp = new ClickUp(clickUpTaskId);
    const { gitLabProject, mergeRequestIId } =
      await clickUp.getGitLabProjectAndMergeRequestIId();
    if (!gitLabProject?.stagingStatus) {
      return;
    }
    const gitLab = new GitLab(gitLabProject.id);
    const mergeRequest = await gitLab.getMergeRequest(mergeRequestIId);
    const clickUpTask = await clickUp.getTask();
    if (
      [
        TaskStatus.Closed,
        TaskStatus.Verified,
        TaskStatus.ReadyToVerify,
        TaskStatus.Done,
      ].includes(clickUpTask.status.status.toLowerCase() as TaskStatus)
    ) {
      this.closeItem(clickUpTaskId);
      return;
    }
    if (gitLabProject.stagingStatus && mergeRequest.state === 'merged') {
      if (
        [
          TaskStatus.DevInReview,
          TaskStatus.InReview,
          TaskStatus.Review,
        ].includes(clickUpTask.status.status.toLowerCase() as TaskStatus)
      ) {
        const list = await ClickUp.getList(clickUpTask.list.id);
        let stagingStatus =
          gitLabProject.stagingStatus[list.name] ||
          gitLabProject.stagingStatus['*'];
        if (
          list.statuses.find((s) => s.status.toLowerCase() === stagingStatus)
        ) {
          await clickUp.setTaskStatus(stagingStatus as TaskStatus);
        } else if (
          list.statuses.find((s) => s.status.toLowerCase() === TaskStatus.Done)
        ) {
          stagingStatus = TaskStatus.Done;
          await clickUp.setTaskStatus(TaskStatus.Done);
        } else {
          stagingStatus = TaskStatus.Closed;
          await clickUp.setTaskStatus(TaskStatus.Closed);
        }
        let message = `${await clickUp.getFullTaskName()} (${clickUpTaskId}): ${titleCase(
          clickUpTask.status.status
        )} -> ${titleCase(stagingStatus)}`;
        if (!clickUpTask.due_date) {
          await clickUp.setTaskDueDateToToday();
          message += '; due date was set';
        }
        displayNotification(message);
        console.log(message);
        this.closeItem(clickUpTaskId);
      }
    }
  }

  public closeItem(clickUpTaskId: string) {
    const content = this.readFile();
    const lines = content
      .split('\n')
      .filter(Boolean)
      .filter((line) => line !== clickUpTaskId);
    this.writeFile(lines.join('\n'));
  }
}
