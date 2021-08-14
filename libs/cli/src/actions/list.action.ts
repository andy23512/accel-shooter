import { GitLab } from "../classes/gitlab.class";
import { getGitLabFromArgv } from "../utils";

export async function listAction() {
  const { gitLabProject, issueNumber } = getGitLabFromArgv();
  const gitLab = new GitLab(gitLabProject.id);
  const issue = await gitLab.getIssue(issueNumber);
  console.log(issue.title);
}
