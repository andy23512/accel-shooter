import {
  ClickUp,
  getSyncChecklistActions,
  normalizeClickUpChecklist,
  normalizeMarkdownChecklist,
  Task,
} from "@accel-shooter/node-shared";
import { Body, Controller, Get, Param, Put } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { format } from "date-fns";
import { writeFileSync } from "fs";
import { join } from "path";

@Controller()
export class AppController {
  constructor(private configService: ConfigService) {}

  @Get("task/:id")
  async getData(@Param("id") taskId: string): Promise<Task> {
    const clickUp = new ClickUp(taskId);
    return clickUp.getTask();
  }

  @Put("task/:id/checklist")
  async putChecklist(
    @Param("id") taskId: string,
    @Body("checklist") checklist: string
  ) {
    const folderPath = this.configService.get<string>("TodoBackupFolder");
    const markdownNormalizedChecklist = normalizeMarkdownChecklist(checklist);
    const clickUp = new ClickUp(taskId);
    const task = await clickUp.getTask();
    const clickUpChecklist = task.checklists.find((c) =>
      c.name.toLowerCase().includes("synced checklist")
    );
    if (clickUpChecklist) {
      const clickUpNormalizedChecklist = normalizeClickUpChecklist(
        clickUpChecklist.items
      );
      const actions = getSyncChecklistActions(
        clickUpNormalizedChecklist,
        markdownNormalizedChecklist
      );
      if (
        actions.update.length +
          actions.create.length +
          actions.delete.length ===
        0
      ) {
        return;
      }
      const time = format(new Date(), "yyyyMMdd_HHmmss");
      writeFileSync(join(folderPath, taskId + "_" + time + ".md"), checklist);
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
  }
}
