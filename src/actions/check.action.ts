import { Checker } from "../classes/checker.class";
import { getGitLabFromArgv } from "../utils";

export async function checkAction() {
  const { gitLabProject, issueNumber } = getGitLabFromArgv();
  const checker = new Checker(gitLabProject, issueNumber);
  await checker.start();
}
