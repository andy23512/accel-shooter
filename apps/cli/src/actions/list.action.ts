import { getInfoFromArgv } from "../utils";

export async function listAction() {
  const { clickUp } = await getInfoFromArgv();
  console.log(clickUp.getFullTaskName());
}
