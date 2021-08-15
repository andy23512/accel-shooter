import { CONFIG } from '@accel-shooter/node-shared';
import { execSync } from 'child_process';
import os from 'os';
import { setIntervalAsync } from 'set-interval-async/dynamic';
import { configReadline, setUpSyncHotkey, syncChecklist } from '../actions';
import { CustomEmojiProgress } from '../classes/emoji-progress.class';
import {
  checkWorkingTreeClean,
  getGitLabFromArgv,
  promiseSpawn,
} from '../utils';

export async function syncAction() {
  configReadline();
  const { gitLab, gitLabProject, issueNumber } = getGitLabFromArgv();
  const gitLabProjectId = gitLabProject.id;
  const mergeRequests = await gitLab.listMergeRequestsWillCloseIssueOnMerge(
    issueNumber
  );
  const lastMergeRequest = mergeRequests[mergeRequests.length - 1];
  if (lastMergeRequest.state === 'merged') {
    console.log('This task is completed.');
    return;
  }
  process.chdir(gitLabProject.path.replace('~', os.homedir()));
  const branchName = execSync('git branch --show-current', {
    encoding: 'utf-8',
  });
  if (branchName.trim() !== lastMergeRequest.source_branch) {
    const isClean = await checkWorkingTreeClean();
    if (!isClean) {
      console.log(
        '\nWorking tree is not clean or something is not pushed. Aborted.'
      );
      process.exit();
    }
    await promiseSpawn(
      'git',
      ['checkout', lastMergeRequest.source_branch],
      'pipe'
    );
  }
  console.log(`${gitLabProject.name} ${issueNumber}`);
  const ep = new CustomEmojiProgress(100, 100);
  setUpSyncHotkey(gitLabProjectId, issueNumber, ep);
  await syncChecklist(gitLabProjectId, issueNumber, ep, true);
  setIntervalAsync(async () => {
    await syncChecklist(gitLabProjectId, issueNumber, ep, false);
  }, CONFIG.SyncIntervalInMinutes * 60 * 1000);
}
