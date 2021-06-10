import inquirer from "inquirer";
import { getGitLabFromArgv } from "../utils";

export async function commentAction() {
  const answers = await inquirer.prompt([
    {
      name: "content",
      message: "Enter comment content",
      type: "editor",
    },
  ]);
  const { gitLab, issueNumber } = getGitLabFromArgv();
  const mergeRequests = await gitLab.listMergeRequestsWillCloseIssueOnMerge(
    issueNumber
  );
  const mergeRequest = mergeRequests[mergeRequests.length - 1];
  await gitLab.createMergeRequestNote(mergeRequest, answers.content);
}
