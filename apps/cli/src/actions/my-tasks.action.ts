import { ClickUp, CONFIG } from "@accel-shooter/node-shared";
import chalk from "chalk";
import moment from "moment";
import { table } from "table";
import { CustomEmojiProgress } from "../classes/emoji-progress.class";

export async function myTasksAction() {
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
  const ep = new CustomEmojiProgress(0, tasks.length);
  for (const task of tasks) {
    const taskPath = [task];
    let t = task;
    while (t.parent) {
      t = await new ClickUp(t.parent).getTask();
      taskPath.push(t);
    }
    const simpleTaskPath = taskPath.map((t) => ({
      name: t.name,
      id: t.id,
      priority: t.priority,
      due_date: t.due_date,
    }));
    const reducedTask = simpleTaskPath.reduce((a, c) => ({
      name: c.name + "\n" + a.name,
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
      name: reducedTask.name,
      id: task.id,
      url: task.url,
      priority: reducedTask.priority,
      due_date: reducedTask.due_date,
      original_priority: task.priority,
      original_due_date: task.due_date,
    });
    ep.increase(1);
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
        t.name + "\n" + t.url,
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
        t.name + "\n" + t.url,
        colorPriority(t.priority?.priority),
        t.due_date ? moment(+t.due_date).format("YYYY-MM-DD") : "",
      ])
    )
  );
}
