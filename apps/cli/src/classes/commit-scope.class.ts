import { CONFIG } from '@accel-shooter/node-shared';
import { appendFileSync } from 'fs';
import untildify from 'untildify';
import { BaseFileRef } from './base-file-ref.class';

export class CommitScope extends BaseFileRef {
  protected get path() {
    return untildify(CONFIG.CommitScopeListFile);
  }

  public getItems() {
    return this.readFile().split('\n').filter(Boolean);
  }

  public addItem(commitScope: string) {
    appendFileSync(this.path, `\n${commitScope}`);
  }
}
