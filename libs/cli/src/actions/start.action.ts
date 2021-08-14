import clipboardy from "clipboardy";
import { readFileSync } from "fs";
import inquirer from "inquirer";
import { render } from "mustache";
import os from "os";
import untildify from "untildify";
import { ClickUp } from "../classes/clickup.class";
import { DailyProgress } from "../classes/daily-progress.class";
import { GitLab } from "../classes/gitlab.class";
import { CustomProgressLog } from "../classes/progress-log.class";
import { Tracker } from "../classes/tracker.class";
import { CONFIG } from "../config";
import { sleep } from "../sleep.utils";
import {
  checkWorkingTreeClean,
  getGitLabBranchNameFromIssueNumberAndTitleAndTaskId,
  promiseSpawn,
} from "../utils";
import { syncAction } from "./sync.action";

export async function startAction() {
  const answers = await inquirer.prompt([
    {
      name: "gitLabProject",
      message: "Choose GitLab Project",
      type: "list",
      choices: CONFIG.GitLabProjects.map((p) => ({
        name: `${p.name} (${p.repo})`,
        value: p,
      })),
      async filter(input: any) {
        process.chdir(input.path.replace("~", os.homedir()));
        const isClean = await checkWorkingTreeClean();
        if (!isClean) {
          console.log(
            "\nWorking tree is not clean or something is not pushed. Aborted."
          );
          process.exit();
        }
        return input;
      },
    },
    {
      name: "clickUpTaskId",
      message: "Enter ClickUp Task ID",
      type: "input",
      filter: (input) => input.replace("#", ""),
    },
    {
      name: "issueTitle",
      message: "Enter Issue Title",
      type: "input",
      default: async (answers: { clickUpTaskId: string }) => {
        let task = await new ClickUp(answers.clickUpTaskId).getTask();
        let result = task.name;
        while (task.parent) {
          task = await new ClickUp(task.parent).getTask();
          result = `${task.name} - ${result}`;
        }
        return result;
      },
    },
    {
      name: "todoConfig",
      message: "Choose Preset To-do Config",
      type: "checkbox",
      choices: CONFIG.ToDoConfigChoices,
    },
  ]);
  const p = new CustomProgressLog("Start", [
    "Get ClickUp Task",
    "Set ClickUp Task Status",
    "Render Todo List",
    "Create GitLab Issue",
    "Create GitLab Branch",
    "Create GitLab Merge Request",
    "Add Daily Progress Entry",
    "Copy Sync Command",
    "Add Tracker Item",
    "Do Git Fetch and Checkout",
  ]);
  process.chdir(answers.gitLabProject.path.replace("~", os.homedir()));
  await checkWorkingTreeClean();
  const gitLab = new GitLab(answers.gitLabProject.id);
  const clickUp = new ClickUp(answers.clickUpTaskId);
  p.start();
  const clickUpTask = await clickUp.getTask();
  const clickUpTaskUrl = clickUpTask["url"];
  const gitLabIssueTitle = answers.issueTitle;
  p.next();
  await clickUp.setTaskStatus("in progress");
  p.next();
  const todoConfigMap: Record<string, boolean> = {};
  answers.todoConfig.forEach((c: string) => {
    todoConfigMap[c] = true;
  });
  todoConfigMap[answers.gitLabProject.name] = true;
  const template = readFileSync(untildify(CONFIG.ToDoTemplate), {
    encoding: "utf-8",
  });
  const endingTodo = render(template, todoConfigMap);
  p.next();
  const gitLabIssue = await gitLab.createIssue(
    gitLabIssueTitle,
    `${clickUpTaskUrl}\n\n${endingTodo}`
  );
  const gitLabIssueNumber = gitLabIssue.iid;
  p.next();
  const gitLabBranch = await gitLab.createBranch(
    getGitLabBranchNameFromIssueNumberAndTitleAndTaskId(
      gitLabIssueNumber,
      answers.clickUpTaskId
    )
  );
  p.next();
  await gitLab.createMergeRequest(
    gitLabIssueNumber,
    gitLabIssueTitle,
    gitLabBranch.name
  );
  p.next();
  const dailyProgressString = `* (In Progress) [${gitLabIssue.title}](${clickUpTaskUrl}) [${answers.gitLabProject.name} ${gitLabIssueNumber}](${gitLabIssue.web_url})`;
  new DailyProgress().addProgressToBuffer(dailyProgressString);
  p.next();
  const syncCommand = `acst sync ${answers.gitLabProject.name} ${gitLabIssueNumber}`;
  clipboardy.writeSync(syncCommand);
  p.next();
  new Tracker().addItem(answers.gitLabProject.name, gitLabIssueNumber);
  p.next();
  process.chdir(answers.gitLabProject.path.replace("~", os.homedir()));
  await promiseSpawn("git", ["fetch"], "pipe");
  await sleep(1000);
  await promiseSpawn("git", ["checkout", gitLabBranch.name], "pipe");
  await promiseSpawn(
    "git",
    ["submodule", "update", "--init", "--recursive"],
    "pipe"
  );
  p.end(0);
  await syncAction();
}
