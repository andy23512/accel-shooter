import {
  Change,
  ClickUp,
  GitLab,
  GitLabProject,
} from '@accel-shooter/node-shared';
import { writeFile } from 'fs';
import inquirer from 'inquirer';
import os from 'os';
import { combineLatest, interval } from 'rxjs';
import untildify from 'untildify';
import { displayNotification, promiseSpawn } from '../utils';
import { checkItemsMap } from './../consts/check-items.const';
import { CheckItem } from './check-item.class';

const SPINNER = [
  '🕛',
  '🕐',
  '🕑',
  '🕒',
  '🕓',
  '🕔',
  '🕕',
  '🕖',
  '🕗',
  '🕘',
  '🕙',
  '🕚',
];

export class Checker {
  private gitLabProjectId: string;
  private gitLab: GitLab;
  private clickUp: ClickUp;

  constructor(
    private gitLabProject: GitLabProject,
    private mergeRequestIId: string,
    private clickUpTaskId: string,
    private selectMode: boolean
  ) {
    this.gitLabProjectId = this.gitLabProject.id;
    this.gitLab = new GitLab(this.gitLabProjectId);
    this.clickUp = new ClickUp(this.clickUpTaskId);
  }

  public async start() {
    const mergeRequest = await this.gitLab.getMergeRequest(
      this.mergeRequestIId
    );
    const mergeRequestChanges = await this.gitLab.getMergeRequestChanges(
      this.mergeRequestIId
    );
    process.chdir(this.gitLabProject.path.replace('~', os.homedir()));
    await promiseSpawn('git', ['checkout', mergeRequest.source_branch], 'pipe');
    const changes = mergeRequestChanges.changes;
    let frontendChanges: Change[] = [];
    let backendChanges: Change[] = [];
    switch (this.gitLabProject.projectType) {
      case 'full':
        frontendChanges = changes.filter((c) =>
          c.new_path.startsWith('frontend')
        );
        backendChanges = changes.filter((c) =>
          c.new_path.startsWith('backend')
        );
        break;
      case 'frontend':
        frontendChanges = changes;
        break;
    }
    const checkItems = checkItemsMap[this.gitLabProject.projectType];
    const projectCheckItems = (this.gitLabProject.checkItems || []).map(
      CheckItem.fromProjectCheckItem
    );
    let runningItems = [...checkItems, ...projectCheckItems];
    if (frontendChanges.length === 0) {
      runningItems = runningItems.filter((item) => item.group !== 'Frontend');
    }
    if (backendChanges.length === 0) {
      runningItems = runningItems.filter((item) => item.group !== 'Backend');
    }
    if (this.selectMode) {
      const answers = await inquirer.prompt([
        {
          name: 'selectedCheckItems',
          message: 'Choose Check Items to Run',
          type: 'checkbox',
          choices: runningItems.map((r) => ({
            name: r.displayName,
            checked: r.defaultChecked,
          })),
          pageSize: runningItems.length,
        },
      ]);
      runningItems = runningItems.filter((r) =>
        answers.selectedCheckItems.includes(r.displayName)
      );
    }
    const context = {
      mergeRequest,
      gitLab: this.gitLab,
      frontendChanges,
      backendChanges,
    };
    const fullTaskName = await this.clickUp.getFullTaskName();
    const obss = runningItems.map((r) => r.getObs(context));
    const checkStream = combineLatest(obss);
    process.stdout.write(runningItems.map(() => '').join('\n'));
    const stream = combineLatest([interval(60), checkStream]).subscribe(
      ([count, statusList]) => {
        process.stdout.moveCursor(0, -statusList.length + 1);
        process.stdout.cursorTo(0);
        process.stdout.clearScreenDown();
        process.stdout.write(
          statusList
            .map((s) => {
              let emoji = '';
              switch (s.code) {
                case -1:
                  emoji = SPINNER[count % SPINNER.length];
                  break;
                case 0:
                  emoji = '⭕';
                  break;
                case 1:
                  emoji = '❌';
                  break;
                default:
                  emoji = '🔴';
              }
              return `${emoji} [${s.group}] ${s.name}`;
            })
            .join('\n')
        );
        if (statusList.every((s) => s.code !== -1)) {
          stream.unsubscribe();
          const nonSuccessStatusList = statusList.filter((s) => s.code !== 0);
          if (nonSuccessStatusList.length > 0) {
            writeFile(
              untildify('~/ac-checker-log'),
              nonSuccessStatusList
                .map(
                  (s) =>
                    `###### [${s.group}] ${s.name} ${s.code}\n${s.stdout}\n${s.stderr}`
                )
                .join('\n\n'),
              () => {}
            );
            displayNotification(
              `${fullTaskName} (${this.clickUpTaskId}): Checker done. Found ${nonSuccessStatusList.length} error(s).`
            );
          } else {
            displayNotification(
              `${fullTaskName} (${this.clickUpTaskId}): Checker done. Found no error.`
            );
          }
          console.log('');
        }
      }
    );
  }
}
