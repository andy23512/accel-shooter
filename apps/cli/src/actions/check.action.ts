import { Checker } from "../classes/checker.class";
import { getInfoFromArgv } from "../utils";

export async function checkAction() {
  const selectMode =
    process.argv.includes("-s") || process.argv.includes("--select");
  process.argv = process.argv.filter((a) => a !== "-s" && a !== "--select");
  const { gitLabProject, mergeRequestIId } = await getInfoFromArgv();
  const checker = new Checker(gitLabProject, mergeRequestIId, selectMode);
  await checker.start();
}
