import {
  ClickUp,
  CONFIG,
  getSyncChecklistActions,
  GitLab,
  normalizeClickUpChecklist,
  normalizeMarkdownChecklist,
  sleep,
} from "@accel-shooter/node-shared";
import clipboardy from "clipboardy";
import { readFileSync, writeFileSync } from "fs";
import inquirer from "inquirer";
import { render } from "mustache";
import os from "os";
import { join } from "path";
import untildify from "untildify";
import { DailyProgress } from "../classes/daily-progress.class";
import { CustomProgressLog } from "../classes/progress-log.class";
import { Tracker } from "../classes/tracker.class";
import { checkWorkingTreeClean, promiseSpawn } from "../utils";
import { openAction } from "./open.action";

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
      name: "mergeRequestTitle",
      message: "Enter Merge Request Title",
      type: "input",
      default: async (answers: { clickUpTaskId: string }) => {
        let task = await new ClickUp(answers.clickUpTaskId).getTask();
        const user = (await ClickUp.getCurrentUser()).user;
        if (!task.assignees.find((a) => a.id === user.id)) {
          console.log("\nTask is not assigned to you. Aborted.");
          process.exit();
        }
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
    "Create GitLab Branch",
    "Create GitLab Merge Request",
    "Create Checklist at ClickUp",
    "Add Daily Progress Entry",
    "Copy Sync Command",
    "Add Tracker Item",
    "Do Git Fetch and Checkout",
  ]);
  process.chdir(answers.gitLabProject.path.replace("~", os.homedir()));
  await checkWorkingTreeClean();
  const gitLab = new GitLab(answers.gitLabProject.id);
  const clickUp = new ClickUp(answers.clickUpTaskId);
  p.start(); // Get ClickUp Task
  const clickUpTask = await clickUp.getTask();
  const clickUpTaskUrl = clickUpTask["url"];
  const gitLabMergeRequestTitle = answers.mergeRequestTitle;
  p.next(); // Set ClickUp Task Status
  await clickUp.setTaskStatus("in progress");
  p.next(); // Render Todo List
  const todoConfigMap: Record<string, boolean> = {};
  answers.todoConfig.forEach((c: string) => {
    todoConfigMap[c] = true;
  });
  todoConfigMap[answers.gitLabProject.name] = true;
  const template = readFileSync(untildify(CONFIG.ToDoTemplate), {
    encoding: "utf-8",
  });
  const endingTodo = render(template, todoConfigMap);
  const path = join(CONFIG.TaskTodoFolder, answers.clickUpTaskId + ".md");
  writeFileSync(path, endingTodo);
  p.next(); // Create GitLab Branch
  const gitLabBranch = await gitLab.createBranch(`CU-${answers.clickUpTaskId}`);
  p.next(); // Create GitLab Merge Request
  await sleep(2000); // prevent "branch restored" bug
  const gitLabMergeRequest = await gitLab.createMergeRequest(
    gitLabMergeRequestTitle,
    gitLabBranch.name
  );
  const gitLabMergeRequestIId = gitLabMergeRequest.iid;
  p.next(); // Create Checklist at ClickUp
  const clickUpChecklistTitle = `Synced checklist [${answers.gitLabProject.id.replace(
    "%2F",
    "/"
  )} !${gitLabMergeRequestIId}]`;
  let clickUpChecklist = clickUpTask.checklists.find(
    (c) => c.name === clickUpChecklistTitle
  );
  if (!clickUpChecklist) {
    clickUpChecklist = (await clickUp.createChecklist(clickUpChecklistTitle))
      .checklist;
    const markdownNormalizedChecklist = normalizeMarkdownChecklist(
      endingTodo,
      true
    );
    const clickUpNormalizedChecklist = normalizeClickUpChecklist(
      clickUpChecklist.items
    );
    const actions = getSyncChecklistActions(
      clickUpNormalizedChecklist,
      markdownNormalizedChecklist
    );
    if (
      actions.update.length + actions.create.length + actions.delete.length ===
      0
    ) {
      return;
    }
    for (const checklistItem of actions.update) {
      await clickUp.updateChecklistItem(
        clickUpChecklist.id,
        checklistItem.id as string,
        checklistItem.name,
        checklistItem.checked,
        checklistItem.order
      );
    }
    for (const checklistItem of actions.create) {
      await clickUp.createChecklistItem(
        clickUpChecklist.id,
        checklistItem.name,
        checklistItem.checked,
        checklistItem.order
      );
    }
    for (const checklistItem of actions.delete) {
      await clickUp.deleteChecklistItem(
        clickUpChecklist.id,
        checklistItem.id as string
      );
    }
  }
  p.next(); // Add Daily Progress Entry
  const dailyProgressString = `* (In Progress) [${gitLabMergeRequestTitle}](${clickUpTaskUrl}) [${answers.gitLabProject.name} ${gitLabMergeRequestIId}](${gitLabMergeRequest.web_url})`;
  new DailyProgress().addProgressToBuffer(dailyProgressString);
  p.next(); // Copy Sync Command
  const syncCommand = `acst sync ${answers.gitLabProject.name} ${gitLabMergeRequestIId}`;
  clipboardy.writeSync(syncCommand);
  p.next(); // Add Tracker Item
  new Tracker().addItem(answers.gitLabProject.name, gitLabMergeRequestIId);
  p.next(); // Do Git Fetch and Checkout
  process.chdir(answers.gitLabProject.path.replace("~", os.homedir()));
  await promiseSpawn("git", ["fetch"], "pipe");
  await sleep(1000);
  await promiseSpawn("git", ["checkout", gitLabBranch.name], "pipe");
  await promiseSpawn(
    "git",
    ["submodule", "update", "--init", "--recursive"],
    "pipe"
  );
  await openAction();
  p.end(0);
}
