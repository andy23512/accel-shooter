import { getInfoFromArgv, openUrlsInTabGroup } from "../utils";

export async function openAction() {
  const { mergeRequest, clickUp, clickUpTask, clickUpTaskId } =
    await getInfoFromArgv();
  const frameUrls = await clickUp.getFrameUrls();
  const urls = [
    mergeRequest.web_url,
    clickUpTask.url,
    `localhost:8112/task/${clickUpTaskId}`,
  ];
  if (frameUrls.length) {
    urls.push(frameUrls[0]);
  }
  openUrlsInTabGroup(urls, clickUpTaskId);
}
