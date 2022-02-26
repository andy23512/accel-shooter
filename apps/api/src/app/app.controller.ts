import { SummarizedTask } from '@accel-shooter/api-interfaces';
import {
  ClickUp,
  CONFIG,
  getSyncChecklistActions,
  GitLab,
  normalizeClickUpChecklist,
  normalizeMarkdownChecklist,
} from '@accel-shooter/node-shared';
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Put,
  Sse,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { watchRx } from 'watch-rx';

const CONFIG_KEY_MAP = {
  todo: 'TodoFile',
  work_note: 'WorkNoteFile',
} as const;

@Controller()
export class AppController {
  constructor(private configService: ConfigService) {}

  @Get('tasks')
  async getTasks(): Promise<{ tasks: SummarizedTask[] }> {
    const path = this.configService.get<string>('MySummarizedTasksFile');
    const tasks = JSON.parse(readFileSync(path, { encoding: 'utf-8' }));
    return { tasks };
  }

  @Get('markdown/:id')
  async getMarkdown(
    @Param('id') markdownId: 'todo' | 'work_note'
  ): Promise<{ content: string }> {
    const configKey = CONFIG_KEY_MAP[markdownId];
    if (!configKey) {
      throw new NotFoundException();
    }
    const path = this.configService.get<string>(configKey);
    const content = readFileSync(path, { encoding: 'utf-8' });
    return { content };
  }

  @Put('markdown/:id')
  async putMarkdown(
    @Param('id') markdownId: 'todo' | 'work_note',
    @Body('content') content: string
  ) {
    const configKey = CONFIG_KEY_MAP[markdownId];
    if (!configKey) {
      throw new NotFoundException();
    }
    const path = this.configService.get<string>(configKey);
    writeFileSync(path, content);
  }

  @Get('task/:id/checklist')
  async getChecklist(@Param('id') taskId: string): Promise<{
    mergeRequestLink: string;
    taskLink: string;
    content: string;
    frameUrl: string;
    fullTaskName: string;
  }> {
    const clickUp = new ClickUp(taskId);
    const task = await clickUp.getTask();
    const fullTaskName = await clickUp.getFullTaskName();
    const frameUrls = await clickUp.getFrameUrls();
    const { gitLabProject, mergeRequestIId } =
      await clickUp.getGitLabProjectAndMergeRequestIId();
    const gitLab = new GitLab(gitLabProject.id);
    const mergeRequest = await gitLab.getMergeRequest(mergeRequestIId);
    const folderPath = this.configService.get<string>('TaskTodoFolder');
    const path = join(folderPath, taskId + '.md');
    const content = readFileSync(path, { encoding: 'utf-8' });
    return {
      mergeRequestLink: mergeRequest.web_url,
      taskLink: task.url,
      content,
      frameUrl: frameUrls.length ? frameUrls[0] : null,
      fullTaskName,
    };
  }

  @Put('task/:id/checklist')
  async putChecklist(
    @Param('id') taskId: string,
    @Body('checklist') checklist: string
  ) {
    const folderPath = this.configService.get<string>('TaskTodoFolder');
    writeFileSync(join(folderPath, taskId + '.md'), checklist);
    const markdownNormalizedChecklist = normalizeMarkdownChecklist(
      checklist,
      true
    );
    const clickUp = new ClickUp(taskId);
    const task = await clickUp.getTask();
    const clickUpChecklist = task.checklists.find((c) =>
      c.name.toLowerCase().includes('synced checklist')
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

  @Sse('todo-sse')
  public todoSse(): Observable<string> {
    return watchRx(CONFIG.TodoFile).pipe(
      map(() => readFileSync(CONFIG.TodoFile, { encoding: 'utf-8' }))
    );
  }
}
