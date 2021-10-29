import { getGitLabFromArgv, openUrlsInTabGroup } from "../utils";

export async function openAction() {
  const { gitLab, issueNumber } = getGitLabFromArgv();
  const issue = await gitLab.getIssue(issueNumber);
  const urls = [];
  urls.push(issue.web_url);
  const mergeRequests = await gitLab.listMergeRequestsWillCloseIssueOnMerge(
    issueNumber
  );
  urls.push(mergeRequests[mergeRequests.length - 1].web_url);
  const description = issue.description;
  const result = description.match(/https:\/\/app.clickup.com\/t\/\w+/);
  if (result) {
    urls.push(result[0]);
  }
  openUrlsInTabGroup(urls, issueNumber);
}
