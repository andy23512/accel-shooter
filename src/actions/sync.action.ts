import { execSync } from "child_process";
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
  const gitLabProjectId = gitLabProject.id;
  const mergeRequests = await gitLab.listMergeRequestsWillCloseIssueOnMerge(
    issueNumber
  );
  const lastMergeRequest = mergeRequests[mergeRequests.length - 1];
  process.chdir(gitLabProject.path.replace("~", os.homedir()));
  const branchName = execSync("git branch --show-current", {
    encoding: "utf-8",
  });
  if (branchName !== lastMergeRequest.source_branch) {
    await checkWorkingTreeClean();
    await promiseSpawn(
      "git",
      ["checkout", lastMergeRequest.source_branch],
      "pipe"
    );
  }
  console.log(`${gitLabProject.name} ${issueNumber}`);
  const ep = new CustomEmojiProgress(0, 100);
  setUpSyncHotkey(gitLabProjectId, issueNumber, ep);
  await syncChecklist(gitLabProjectId, issueNumber, ep, true);
  setIntervalAsync(async () => {
    await syncChecklist(gitLabProjectId, issueNumber, ep, false);
  }, CONFIG.SyncIntervalInMinutes * 60 * 1000);
}
