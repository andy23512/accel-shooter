import { execSync } from "child_process";
import os from "os";
import { configReadline } from "../actions";
import { checkWorkingTreeClean, getInfoFromArgv, promiseSpawn } from "../utils";

export async function switchAction() {
  configReadline();
  const { gitLabProject, mergeRequest } = await getInfoFromArgv();
  if (mergeRequest.state === "merged") {
    console.log("This task is completed.");
    return;
  }
  process.chdir(gitLabProject.path.replace("~", os.homedir()));
  const branchName = execSync("git branch --show-current", {
    encoding: "utf-8",
  });
  if (branchName.trim() !== mergeRequest.source_branch) {
    const isClean = await checkWorkingTreeClean();
    if (!isClean) {
      console.log(
        "\nWorking tree is not clean or something is not pushed. Aborted."
      );
      process.exit();
    }
    await promiseSpawn("git", ["checkout", mergeRequest.source_branch], "pipe");
  }
}
