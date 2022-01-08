import { GitLab } from "@accel-shooter/node-shared";
import { getGitLabFromArgv } from "../utils";

export async function showDiffAction() {
  const { gitLabProject, issueNumber } = getGitLabFromArgv();
  const gitLab = new GitLab(gitLabProject.id);
  const mergeRequests = await gitLab.listMergeRequestsWillCloseIssueOnMerge(
    issueNumber
  );
  const mergeRequest = mergeRequests[mergeRequests.length - 1];
  const mergeRequestChanges = await gitLab.getMergeRequestChanges(
    mergeRequest.iid
  );
  const changes = mergeRequestChanges.changes;
  const templateChanges = changes.filter((c) => c.new_path.endsWith(".html"));
  for (const change of templateChanges) {
    console.log(`### ${change.new_path}`);
    console.log(change.diff);
  }
}
