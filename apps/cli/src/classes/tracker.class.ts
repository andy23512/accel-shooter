import { ClickUp, CONFIG, GitLab, titleCase } from '@accel-shooter/node-shared';
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
      ['closed', 'verified', 'ready to verify', 'done'].includes(
        clickUpTask.status.status.toLowerCase()
      )
    ) {
      this.closeItem(clickUpTaskId);
      return;
    }
    if (gitLabProject.stagingStatus && mergeRequest.state === 'merged') {
      if (clickUpTask.status.status === 'in review') {
        const list = await ClickUp.getList(clickUpTask.list.id);
        let stagingStatus =
          gitLabProject.stagingStatus[list.name] ||
          gitLabProject.stagingStatus['*'];
        if (
          list.statuses.find((s) => s.status.toLowerCase() === stagingStatus)
        ) {
          await clickUp.setTaskStatus(stagingStatus);
        } else if (
          list.statuses.find((s) => s.status.toLowerCase() === 'done')
        ) {
          stagingStatus = 'done';
          await clickUp.setTaskStatus('done');
        } else {
          stagingStatus = 'closed';
          await clickUp.setTaskStatus('closed');
        }
        const message = `${await clickUp.getFullTaskName()} (${clickUpTaskId}): In Review -> ${titleCase(
          stagingStatus
        )}`;
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
