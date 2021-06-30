import os from "os";
import { setIntervalAsync } from "set-interval-async/dynamic";
import { configReadline, setUpSyncHotkey, syncChecklist } from "../actions";
import { CustomEmojiProgress } from "../classes/emoji-progress.class";
import { CONFIG } from "../config";
import {
  checkWorkingTreeClean,
  getGitLabFromArgv,
  promiseSpawn,
} from "../utils";

export async function syncAction() {
  configReadline();
  const { gitLab, gitLabProject, issueNumber } = getGitLabFromArgv();
  process.chdir(gitLabProject.path.replace("~", os.homedir()));
  await checkWorkingTreeClean();
  const gitLabProjectId = gitLabProject.id;
  const mergeRequests = await gitLab.listMergeRequestsWillCloseIssueOnMerge(
    issueNumber
  );
  const lastMergeRequest = mergeRequests[mergeRequests.length - 1];
  await promiseSpawn(
    "git",
    ["checkout", lastMergeRequest.source_branch],
    "pipe"
  );
  const ep = new CustomEmojiProgress(0, 100);
  setUpSyncHotkey(gitLabProjectId, issueNumber, ep);
  await syncChecklist(gitLabProjectId, issueNumber, ep, true);
  setIntervalAsync(async () => {
    await syncChecklist(gitLabProjectId, issueNumber, ep, false);
  }, CONFIG.SyncIntervalInMinutes * 60 * 1000);
}
