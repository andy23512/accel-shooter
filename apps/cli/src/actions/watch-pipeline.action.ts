import { GitLab } from '@accel-shooter/node-shared';
import { Action } from '../classes/action.class';
import { displayNotification, getGitLabProjectConfigByName } from '../utils';

export class WatchPipelineAction extends Action {
  public command = 'watchPipeline';
  public description = 'watch pipeline status of a merge request';
  public alias = 'wp';
  public arguments = [
    { name: 'projectName', description: 'GitLab project name' },
    { name: 'mergeRequestIId', description: 'merge request iid' },
  ];
  public async run(projectName: string, mergeRequestIId: string) {
    const gitLabProject = getGitLabProjectConfigByName(projectName);
    const gitLab = new GitLab(gitLabProject.id);
    async function getAndPrintPipelineStatus() {
      const mergeRequest = await gitLab.getMergeRequest(mergeRequestIId);
      const status = mergeRequest.head_pipeline?.status || 'none';
      if (status !== 'running' && status !== 'none') {
        displayNotification(
          `Pipeline of ${projectName} !${mergeRequestIId} status: ${status}`
        );
        process.exit();
      }
    }
    getAndPrintPipelineStatus();
    setInterval(getAndPrintPipelineStatus, 30 * 1000);
  }
}
