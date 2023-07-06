import { SummarizedTask, TimeTrack } from '@accel-shooter/api-interfaces';
import { CONFIG, ClickUp, GitLab } from '@accel-shooter/node-shared';
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Sse,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { watchRx } from 'watch-rx';

const CONFIG_KEY_MAP = {
  todo: 'TodoFile',
  work_note: 'WorkNoteFile',
} as const;

const FIGMA_REGEX =
  /(?:https:\/\/)?(?:www\.)?figma\.com\/(file|proto)\/([0-9a-zA-Z]{22,128})(?:\/([^\?\n\r\/]+)?((?:\?[^\/]*?node-id=([^&\n\r\/]+))?[^\/]*?)(\/duplicate)?)?/g;

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
    [...content.matchAll(FIGMA_REGEX)].forEach(([url]) => {
      frameUrls.push(url);
    });
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

  @Get('task/:id/time_tracks')
  async getTimeTracks(
    @Param('id') taskId: string
  ): Promise<{ timeTracks: TimeTrack[] }> {
    const folderPath = this.configService.get<string>('TaskTimeTrackFolder');
    const path = join(folderPath, taskId + '.csv');
    if (existsSync(path)) {
      const content = readFileSync(path, { encoding: 'utf-8' });
      return {
        timeTracks: content
          .split('\n')
          .filter(Boolean)
          .map((l) => {
            const cells = l.split(',');
            return { start: cells[0], end: cells[1] };
          }),
      };
    } else {
      return { timeTracks: [] };
    }
  }

  @Post('task/:id/time_track')
  async postTimeTrack(
    @Param('id') taskId: string,
    @Body('type') type: 'start' | 'end'
  ) {
    const folderPath = this.configService.get<string>('TaskTimeTrackFolder');
    const path = join(folderPath, taskId + '.csv');
    const time = new Date().toISOString();
    const addedContent = type === 'start' ? `\n${time},` : time;
    appendFileSync(path, addedContent, { encoding: 'utf-8' });
  }

  @Sse('todo-sse')
  public todoSse(): Observable<string> {
    return watchRx(CONFIG.TodoChangeNotificationFile).pipe(
      map(() => readFileSync(CONFIG.TodoFile, { encoding: 'utf-8' }))
    );
  }
}
