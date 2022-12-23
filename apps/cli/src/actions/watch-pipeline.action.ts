import { GitLab } from '@accel-shooter/node-shared';
import { displayNotification, getGitLabProjectConfigByName } from '../utils';

export async function watchPipelineAction() {
  const projectName = process.argv[3];
  const mergeRequestIId = process.argv[4];
  const gitLabProject = getGitLabProjectConfigByName(projectName);
  const gitLab = new GitLab(gitLabProject.id);
  async function getAndPrintPipelineStatus() {
    const mergeRequest = await gitLab.getMergeRequest(mergeRequestIId);
    const status = mergeRequest.head_pipeline?.status || 'none';
    console.log(status);
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
