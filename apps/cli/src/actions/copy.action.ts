import clipboardy from "clipboardy";
import { getInfoFromArgv } from "../utils";

export async function copyAction() {
  const { mergeRequestIId, gitLabProject, mergeRequest, clickUp } =
    await getInfoFromArgv();
  const task = await clickUp.getTask();
  const name = await clickUp.getFullTaskName();
  const string = `[${name}](${task.url}) [${gitLabProject.name} ${mergeRequestIId}](${mergeRequest.web_url})`;
  clipboardy.writeSync(string);
  console.log("Copied!");
}
