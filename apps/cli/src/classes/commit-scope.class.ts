import { CONFIG } from '@accel-shooter/node-shared';
import jsYaml from 'js-yaml';
import untildify from 'untildify';
import { BaseFileRef } from './base-file-ref.class';

export class CommitScope extends BaseFileRef {
  protected get path() {
    return untildify(CONFIG.CommitScopeFile);
  }

  public getItems(repoName: string) {
    const commitScopeDict = jsYaml.load(this.readFile()) as Record<
      string,
      string[]
    >;
    const items = commitScopeDict[repoName] || [];
    items.unshift('empty');
    return items;
  }
}
