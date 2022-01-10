import inquirer from "inquirer";
import { getInfoFromArgv } from "../utils";

export async function commentAction() {
  const answers = await inquirer.prompt([
    {
      name: "content",
      message: "Enter comment content",
      type: "editor",
    },
  ]);
  const { gitLab, mergeRequest } = await getInfoFromArgv();
  await gitLab.createMergeRequestNote(mergeRequest, answers.content);
}
