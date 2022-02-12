import { ClickUp, CONFIG } from "@accel-shooter/node-shared";
import { writeFileSync } from "fs";

export async function dumpMyTasksAction() {
  const mySummarizedTasks = await ClickUp.getMySummarizedTasks();
  writeFileSync(
    CONFIG.MySummarizedTasksFile,
    JSON.stringify(mySummarizedTasks)
  );
}
