import { CONFIG } from '@accel-shooter/node-shared';
import { writeFileSync } from 'fs';
import untildify from 'untildify';
import { v4 as uuidv4 } from 'uuid';
import { BaseFileRef } from './base-file-ref.class';

export class Todo extends BaseFileRef {
  protected get path() {
    return untildify(CONFIG.TodoFile);
  }

  public writeFile(content: string) {
    super.writeFile(content);
    writeFileSync(untildify(CONFIG.TodoChangeNotificationFile), uuidv4());
  }

  public addTodoToBuffer(todoString: string) {
    const content = this.readFile();
    const updatedTodoContent = content.replace(
      '## Todos',
      `## Todos\n${todoString}`
    );
    this.writeFile(updatedTodoContent);
  }
}
