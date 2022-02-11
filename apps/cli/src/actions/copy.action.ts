import clipboardy from "clipboardy";
import { getInfoFromArgv } from "../utils";

export async function copyAction() {
  const { clickUp } = await getInfoFromArgv(true);
  const task = await clickUp.getTask();
  const name = await clickUp.getFullTaskName();
  const string = `[${name}](${task.url})`;
  clipboardy.writeSync(string);
  console.log("Copied!");
}
