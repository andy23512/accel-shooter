import { CONFIG } from '@accel-shooter/node-shared';
import untildify from 'untildify';
import { BaseFileRef } from './base-file-ref.class';

export class Todo extends BaseFileRef {
  protected get path() {
    return untildify(CONFIG.TodoFile);
  }

  public addTodoToBuffer(todoString: string) {
    const content = this.readFile();
    const updatedDpContent = content.replace(
      '## Buffer End',
      `    ${todoString}\n## Buffer End`
    );
    this.writeFile(updatedDpContent);
  }
}