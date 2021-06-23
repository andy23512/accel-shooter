import { Checker } from "../classes/checker.class";
import { getGitLabFromArgv } from "../utils";

export async function checkAction() {
  const selectMode =
    process.argv.includes("-s") || process.argv.includes("--select");
  process.argv = process.argv.filter((a) => a !== "-s" && a !== "--select");
  const { gitLabProject, issueNumber } = getGitLabFromArgv();
  const checker = new Checker(gitLabProject, issueNumber, selectMode);
  await checker.start();
}
