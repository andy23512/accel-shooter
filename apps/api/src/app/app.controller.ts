import {
  ClickUp,
  getSyncChecklistActions,
  GitLab,
  normalizeClickUpChecklist,
  normalizeMarkdownChecklist,
} from "@accel-shooter/node-shared";
import { Body, Controller, Get, Param, Put } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

@Controller()
export class AppController {
  constructor(private configService: ConfigService) {}

  @Get("task/:id/checklist")
  async getData(
    @Param("id") taskId: string
  ): Promise<{
    mergeRequestLink: string;
    taskLink: string;
    content: string;
    frameUrl: string;
  }> {
    const clickUp = new ClickUp(taskId);
    const task = await clickUp.getTask();
    const frameUrls = await clickUp.getFrameUrls();
    const { gitLabProject, mergeRequestIId } =
      await clickUp.getGitLabProjectAndMergeRequestIId();
    const gitLab = new GitLab(gitLabProject.id);
    const mergeRequest = await gitLab.getMergeRequest(mergeRequestIId);
    const folderPath = this.configService.get<string>("TodoBackupFolder");
    const path = join(folderPath, taskId + ".md");
    const content = readFileSync(path, { encoding: "utf-8" });
    return {
      mergeRequestLink: mergeRequest.web_url,
      taskLink: task.url,
      content,
      frameUrl: frameUrls.length ? frameUrls[0] : null,
    };
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
      writeFileSync(join(folderPath, taskId + ".md"), checklist);
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
