import { getInfoFromArgv, openUrlsInTabGroup } from "../utils";

export async function openAction() {
  const { clickUpTaskId } = await getInfoFromArgv();
  const urls = [`localhost:8112/task/${clickUpTaskId}`];
  openUrlsInTabGroup(urls, clickUpTaskId);
}
