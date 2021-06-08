import chalk from "chalk";
import { execSync } from "child_process";
import clipboardy from "clipboardy";
import { format } from "date-fns";
import { readFileSync } from "fs";
import inquirer from "inquirer";
import moment from "moment";
import { render } from "mustache";
import open from "open";
import os from "os";
import { setIntervalAsync } from "set-interval-async/dynamic";
import { table } from "table";
import untildify from "untildify";
import { configReadline, setUpSyncHotkey, syncChecklist } from "./actions";
import { Checker } from "./checker";
import { ClickUp } from "./clickup";
import { CONFIG } from "./config";
import { DailyProgress } from "./daily-progress";
import { CustomEmojiProgress } from "./emoji-progress";
import {
  getGitLabBranchNameFromIssueNumberAndTitleAndTaskId,
  GitLab,
} from "./gitlab";
import { CustomProgressLog } from "./progress-log";
import { Tracker } from "./tracker";
import {
  getClickUpTaskIdFromGitLabIssue,
  getGitLabProjectConfigByName,
  normalizeGitLabIssueChecklist,
  promiseSpawn,
  updateTaskStatusInDp,
} from "./utils";

const actionAlias: { [key: string]: string } = {
  st: "start",
  o: "open",
  sy: "sync",
  c: "copy",
  t: "track",
  e: "end",
  re: "revertEnd",
};

const actions: { [key: string]: () => Promise<any> } = {
  async start() {
    configReadline();
    const answers = await inquirer.prompt([
      {
        name: "gitLabProject",
        message: "Choose GitLab Project",
        type: "list",
        choices: CONFIG.GitLabProjects.map((p) => ({
          name: `${p.name} (${p.repo})`,
          value: p,
        })),
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
    const dailyProgressString = `* (In Progress) ${gitLabIssue.title} (${answers.gitLabProject.name} ${gitLabIssueNumber}, ${clickUpTaskUrl})`;
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
  },
  async open() {
    const issueNumber = process.argv[4];
    const gitLab = new GitLab(getGitLabProjectIdFromArgv());
    const answers = await inquirer.prompt([
      {
        name: "types",
        message: "Choose Link Type to open",
        type: "checkbox",
        choices: [
          { name: "Issue", value: "issue" },
          { name: "Merge Request", value: "merge-request" },
          { name: "Task", value: "task" },
        ],
      },
    ]);
    const issue = await gitLab.getIssue(issueNumber);
    for (const type of answers.types) {
      switch (type) {
        case "issue":
          open(issue.web_url);
          break;
        case "merge-request":
          const mergeRequests =
            await gitLab.listMergeRequestsWillCloseIssueOnMerge(issueNumber);
          open(mergeRequests[mergeRequests.length - 1].web_url);
          break;
        case "task":
          const description = issue.description;
          const result = description.match(/https:\/\/app.clickup.com\/t\/\w+/);
          if (result) {
            open(result[0]);
          }
          break;
      }
    }
  },
  async sync() {
    configReadline();
    const { gitLabProject, issueNumber } = getGitLabProjectAndIssueNumber();
    const gitLabProjectId = gitLabProject.id;
    const gitLab = new GitLab(gitLabProject.id);
    const mergeRequests = await gitLab.listMergeRequestsWillCloseIssueOnMerge(
      issueNumber
    );
    const lastMergeRequest = mergeRequests[mergeRequests.length - 1];
    process.chdir(gitLabProject.path.replace("~", os.homedir()));
    await promiseSpawn(
      "git",
      ["checkout", lastMergeRequest.source_branch],
      "pipe"
    );
    const ep = new CustomEmojiProgress(0, 100);
    setUpSyncHotkey(gitLabProjectId, issueNumber, ep);
    await syncChecklist(gitLabProjectId, issueNumber, ep, true);
    setIntervalAsync(async () => {
      await syncChecklist(gitLabProjectId, issueNumber, ep, false);
    }, CONFIG.SyncIntervalInMinutes * 60 * 1000);
  },
  async copy() {
    const day =
      process.argv.length >= 4
        ? process.argv[3]
        : format(new Date(), "yyyy/MM/dd");
    const dp = new DailyProgress();
    const record = dp.getRecordByDay(day);
    if (record) {
      const newDpRecord = await updateTaskStatusInDp(record);
      dp.writeRecordByDay(day, newDpRecord);
      clipboardy.writeSync(newDpRecord);
      console.log(newDpRecord);
      console.log("Copied!");
    }
  },
  async track() {
    const tracker = new Tracker();
    tracker.startSync();
  },
  async end() {
    const gitLabProjectId = getGitLabProjectIdFromArgv();
    const issueNumber = process.argv[4];
    const gitLab = new GitLab(gitLabProjectId);
    const p = new CustomProgressLog("End", [
      "Get GitLab Issue",
      "Get GitLab Merge Request",
      "Update GitLab Merge Request Ready Status and Assignee",
      "Update ClickUp Task Status",
    ]);
    p.start();
    const issue = await gitLab.getIssue(issueNumber);
    const gitLabChecklistText = issue.description
      .replace(/https:\/\/app.clickup.com\/t\/\w+/g, "")
      .trim();
    const gitLabNormalizedChecklist =
      normalizeGitLabIssueChecklist(gitLabChecklistText);
    const fullCompleted = gitLabNormalizedChecklist.every(
      (item) => item.checked
    );
    if (!fullCompleted) {
      console.log("This task has uncompleted todo(s).");
      return;
    }
    p.next();
    const mergeRequests = await gitLab.listMergeRequestsWillCloseIssueOnMerge(
      issueNumber
    );
    const mergeRequest = mergeRequests[mergeRequests.length - 1];
    p.next();
    await gitLab.markMergeRequestAsReadyAndAddAssignee(mergeRequest);
    p.next();
    const clickUpTaskId = getClickUpTaskIdFromGitLabIssue(issue);
    if (clickUpTaskId) {
      const clickUp = new ClickUp(clickUpTaskId);
      await clickUp.setTaskStatus("in review");
    }
    p.end(0);
  },
  async revertEnd() {
    const gitLabProjectId = getGitLabProjectIdFromArgv();
    const issueNumber = process.argv[4];
    const gitLab = new GitLab(gitLabProjectId);
    const p = new CustomProgressLog("End", [
      "Get GitLab Issue",
      "Get GitLab Merge Request",
      "Update GitLab Merge Request Ready Status and Assignee",
      "Update ClickUp Task Status",
    ]);
    p.start();
    const issue = await gitLab.getIssue(issueNumber);
    p.next();
    const mergeRequests = await gitLab.listMergeRequestsWillCloseIssueOnMerge(
      issueNumber
    );
    const mergeRequest = mergeRequests[mergeRequests.length - 1];
    p.next();
    await gitLab.markMergeRequestAsUnreadyAndSetAssigneeToSelf(mergeRequest);
    p.next();
    const clickUpTaskId = getClickUpTaskIdFromGitLabIssue(issue);
    if (clickUpTaskId) {
      const clickUp = new ClickUp(clickUpTaskId);
      await clickUp.setTaskStatus("in progress");
    }
    p.end(0);
  },

  async crossChecklist() {
    const answers = await inquirer.prompt([
      {
        name: "initialSpaces",
        message: "Enter prefix spaces",
        type: "input",
      },
      {
        name: "firstLevel",
        message: "Enter first level items",
        type: "editor",
      },
      {
        name: "secondLevel",
        message: "Enter second level items",
        type: "editor",
        default: CONFIG.CrossChecklistDefaultSecondLevel.join("\n"),
      },
    ]);
    const firstLevelItems = (answers.firstLevel as string)
      .split("\n")
      .filter(Boolean);
    const secondLevelItems = (answers.secondLevel as string)
      .split("\n")
      .filter(Boolean);
    const result = firstLevelItems
      .map(
        (e) =>
          answers.initialSpaces +
          "  - [ ] " +
          e +
          "\n" +
          secondLevelItems
            .map((f) => `${answers.initialSpaces}    - [ ] ${f}`)
            .join("\n")
      )
      .join("\n");
    clipboardy.writeSync(result);
    console.log(result);
    console.log("Copied!");
  },

  async RTVTasks() {
    const user = (await ClickUp.getCurrentUser()).user;
    const team = (await ClickUp.getTeams()).teams.find(
      (t) => t.name === CONFIG.ClickUpTeam
    );
    if (!team) {
      console.log("Team does not exist.");
      return;
    }
    const tasks = (await ClickUp.getRTVTasks(team.id, user.id)).tasks;
    console.log(tasks.map((t) => `- ${t.name} (${t.url})`).join("\n"));
  },

  async check() {
    const { gitLabProject, issueNumber } = getGitLabProjectAndIssueNumber();
    const checker = new Checker(gitLabProject, issueNumber);
    await checker.start();
  },

  async myTasks() {
    const user = (await ClickUp.getCurrentUser()).user;
    const team = (await ClickUp.getTeams()).teams.find(
      (t) => t.name === CONFIG.ClickUpTeam
    );
    if (!team) {
      console.log("Team does not exist.");
      return;
    }
    const tasks = (await ClickUp.getMyTasks(team.id, user.id)).tasks;
    const summarizedTasks: any[] = [];
    for (const task of tasks) {
      const taskPath = [task];
      let t = task;
      while (t.parent) {
        t = await new ClickUp(task.parent).getTask();
        taskPath.push(t);
      }
      const simpleTaskPath = taskPath.map((t) => ({
        name: t.name,
        id: t.id,
        priority: t.priority,
        due_date: t.due_date,
      }));
      const reducedTask = simpleTaskPath.reduce((a, c) => ({
        name: a.name,
        id: a.id,
        priority:
          (a.priority === null && c.priority !== null) ||
          (a.priority !== null &&
            c.priority !== null &&
            parseInt(a.priority.orderindex) > parseInt(c.priority.orderindex))
            ? c.priority
            : a.priority,
        due_date:
          (a.due_date === null && c.due_date !== null) ||
          (a.due_date !== null &&
            c.due_date !== null &&
            parseInt(a.due_date) > parseInt(c.due_date))
            ? c.due_date
            : a.due_date,
      }));
      summarizedTasks.push({
        name: task.name,
        id: task.id,
        priority: reducedTask.priority,
        due_date: reducedTask.due_date,
        original_priority: task.priority,
        original_due_date: task.due_date,
      });
    }
    const compare = (a: null | string, b: null | string) => {
      if (a === b) {
        return 0;
      } else if (a === null || typeof a === "undefined") {
        return 1;
      } else if (b === null || typeof b === "undefined") {
        return -1;
      }
      return parseInt(a) - parseInt(b);
    };
    const colorPriority = (priority: string | undefined) => {
      switch (priority) {
        case "urgent":
          return chalk.redBright(priority);
        case "high":
          return chalk.yellowBright(priority);
        case "normal":
          return chalk.cyanBright(priority);
        default:
          return chalk.white(priority);
      }
    };
    const topDueDateTasks = summarizedTasks
      .filter((t) => t.due_date)
      .sort((a, b) => {
        return (
          compare(a.due_date, b.due_date) ||
          compare(a.priority?.orderindex, b.priority?.orderindex)
        );
      });
    console.log("Sort by Due Date:");
    console.log(
      table(
        topDueDateTasks.map((t) => [
          t.name,
          colorPriority(t.priority?.priority),
          moment(+t.due_date).format("YYYY-MM-DD"),
        ])
      )
    );
    const topPriorityTasks = summarizedTasks
      .filter((t) => t.priority)
      .sort((a, b) => {
        return (
          compare(a.priority?.orderindex, b.priority?.orderindex) ||
          compare(a.due_date, b.due_date)
        );
      });
    console.log("Sort by Priority:");
    console.log(
      table(
        topPriorityTasks.map((t) => [
          t.name,
          colorPriority(t.priority?.priority),
          t.due_date ? moment(+t.due_date).format("YYYY-MM-DD") : "",
        ])
      )
    );
  },
};

(async () => {
  const action = actionAlias[process.argv[2]] || process.argv[2];
  if (actions[action]) {
    await actions[action]();
  } else if (CONFIG.WebPageAlias[action]) {
    open(CONFIG.WebPageAlias[action]);
  } else {
    throw Error(`Action ${action} is not supported.`);
  }
})();

function getGitLabProjectIdByName(name: string) {
  const gitLabProjectId = getGitLabProjectConfigByName(name)?.id;
  if (!gitLabProjectId) {
    throw new Error("Cannot find project");
  }
  return gitLabProjectId;
}

function getGitLabProjectIdFromArgv() {
  return getGitLabProjectIdByName(process.argv[3]);
}

function getGitLabProjectFromArgv() {
  return getGitLabProjectConfigByName(process.argv[3]);
}

function getGitLabProjectAndIssueNumber() {
  if (process.argv.length === 3) {
    const directory = execSync("pwd", { encoding: "utf-8" });
    const gitLabProject = CONFIG.GitLabProjects.find((p) =>
      directory.startsWith(p.path)
    );
    if (!gitLabProject) {
      throw Error("No such project");
    }
    const branchName = execSync("git branch --show-current", {
      encoding: "utf-8",
    });
    const match = branchName.match(/^[0-9]+/);
    if (!match) {
      throw Error("Cannot get issue number from branch");
    }
    const issueNumber = match[0];
    return { gitLabProject, issueNumber };
  } else {
    const gitLabProject = getGitLabProjectFromArgv();
    if (!gitLabProject) {
      throw Error("No such project");
    }
    return { gitLabProject, issueNumber: process.argv[4] };
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
