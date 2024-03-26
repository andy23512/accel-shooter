import { SummarizedTask, TddStage } from '@accel-shooter/api-interfaces';
import {
  CONFIG,
  ClickUp,
  Comment,
  GitLab,
  Task,
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
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { watchRx } from 'watch-rx';

const CONFIG_KEY_MAP = {
  todo: 'TodoFile',
  work_note: 'WorkNoteFile',
} as const;

const MARKDOWN_LINK_REGEX = /\[([\w\s]+)\]\((https?:\/\/[\w./?=#&()-]+)\)/g;

@Controller()
export class AppController {
  constructor(private configService: ConfigService) {}

  @Get('tasks')
  async getTasks(): Promise<{ tasks: SummarizedTask[] }> {
    const path = this.configService.get<string>('MySummarizedTasksFile');
    const tasks = JSON.parse(readFileSync(path, { encoding: 'utf-8' }));
    return { tasks };
  }

  @Get('task/:id')
  async getTask(@Param('id') taskId: string): Promise<{ task: Task }> {
    const clickUp = new ClickUp(taskId);
    const task = await clickUp.getTask();
    return {
      task,
    };
  }

  @Get('task/:id/comments')
  async getTaskComments(
    @Param('id') taskId: string
  ): Promise<{ comments: Comment[] }> {
    const clickUp = new ClickUp(taskId);
    const comments = await clickUp.getTaskComments();
    return {
      comments,
    };
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
    fullTaskName: string;
    links: { name: string; url: string }[];
  }> {
    const clickUp = new ClickUp(taskId);
    const task = await clickUp.getTask();
    const fullTaskName = await clickUp.getFullTaskName(task);
    const { gitLabProject, mergeRequestIId } =
      await clickUp.getGitLabProjectAndMergeRequestIId(task);
    const gitLab = new GitLab(gitLabProject.id);
    const mergeRequest = await gitLab.getMergeRequest(mergeRequestIId);
    const folderPath = this.configService.get<string>('TaskTodoFolder');
    const path = join(folderPath, taskId + '.md');
    const content = readFileSync(path, { encoding: 'utf-8' });
    const links = [...content.matchAll(MARKDOWN_LINK_REGEX)].map(
      ([, name, url]) => ({
        name,
        url,
      })
    );
    return {
      mergeRequestLink: mergeRequest.web_url,
      taskLink: task.url,
      content,
      links,
      fullTaskName,
    };
  }

  @Get('task/:id/tdd_stage')
  async getTddStage(@Param('id') taskId: string): Promise<{
    stage: TddStage;
  }> {
    const folderPath = this.configService.get<string>('TaskTddStageFolder');
    const path = join(folderPath, taskId + '.txt');
    const stage = existsSync(path)
      ? (readFileSync(path, { encoding: 'utf-8' }).trim() as TddStage)
      : TddStage.Test;
    return { stage };
  }

  @Put('task/:id/tdd_stage')
  async putTddStage(
    @Param('id') taskId: string,
    @Body('stage') stage: TddStage
  ) {
    const folderPath = this.configService.get<string>('TaskTddStageFolder');
    const path = join(folderPath, taskId + '.txt');
    writeFileSync(path, stage);
  }

  @Put('task/:id/checklist')
  async putChecklist(
    @Param('id') taskId: string,
    @Body('checklist') checklist: string
  ) {
    const folderPath = this.configService.get<string>('TaskTodoFolder');
    writeFileSync(join(folderPath, taskId + '.md'), checklist);
    const clickUp = new ClickUp(taskId);
    const task = await clickUp.getTask();
    const clickUpChecklist = task.checklists.find((c) =>
      c.name.toLowerCase().includes('synced checklist')
    );
    if (clickUpChecklist) {
      await clickUp.updateChecklist(clickUpChecklist, checklist);
    }
  }

  async getMRFromTaskId(taskId: string) {
    const clickUp = new ClickUp(taskId);
    const { gitLabProject, mergeRequestIId } =
      await clickUp.getGitLabProjectAndMergeRequestIId();
    const gitLab = new GitLab(gitLabProject.id);
    return gitLab.getMergeRequest(mergeRequestIId);
  }

  @Get('task/:id/mr_description')
  async getMRDescription(
    @Param('id') taskId: string
  ): Promise<{ content: string }> {
    const mergeRequest = await this.getMRFromTaskId(taskId);
    return { content: mergeRequest.description };
  }

  @Put('task/:id/mr_description')
  async putMRDescription(
    @Param('id') taskId: string,
    @Body('content') content: string
  ) {
    const clickUp = new ClickUp(taskId);
    const { gitLabProject, mergeRequestIId } =
      await clickUp.getGitLabProjectAndMergeRequestIId();
    const gitLab = new GitLab(gitLabProject.id);
    const mergeRequest = await gitLab.getMergeRequest(mergeRequestIId);
    await gitLab.updateMergeRequestDescription(mergeRequest, content);
  }

  @Get('task/:id/mr_pipeline_status')
  async getMRPipelineStatus(
    @Param('id') taskId: string
  ): Promise<{ content: string }> {
    const mergeRequest = await this.getMRFromTaskId(taskId);
    return { content: mergeRequest.head_pipeline?.status || 'none' };
  }

  @Get('task/:id/mr_link_status')
  async getMRLinkStatus(
    @Param('id') taskId: string
  ): Promise<{ linked: boolean }> {
    const clickUp = new ClickUp(taskId);
    const { gitLabProject, mergeRequestIId } =
      await clickUp.getGitLabProjectAndMergeRequestIId();
    const gitLab = new GitLab(gitLabProject.id);
    const notes = await gitLab.getMergeRequestNotes(mergeRequestIId);
    return {
      linked: notes.some((n) => n.body.startsWith('Task linked:')),
    };
  }

  @Sse('todo-sse')
  public todoSse(): Observable<string> {
    return watchRx(CONFIG.TodoChangeNotificationFile).pipe(
      map(() => readFileSync(CONFIG.TodoFile, { encoding: 'utf-8' }))
    );
  }
}
