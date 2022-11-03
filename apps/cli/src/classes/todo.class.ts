import { writeFileSync } from 'fs';
import untildify from 'untildify';
import { v4 as uuidv4 } from 'uuid';

import { CONFIG } from '@accel-shooter/node-shared';

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

  public removeTodo(clickUpTaskId: string) {
    const todoContent = this.readFile();
    const matchResult = todoContent.match(/## Todos\n([\s\S]+)## Processing/);
    if (matchResult) {
      const todoList = matchResult[1].split('\n');
      const newTodoList = todoList.filter(
        (t) => t && !t.includes(clickUpTaskId)
      );
      const newTodoContent = todoContent.replace(
        matchResult[1],
        newTodoList.map((str) => str + '\n').join('')
      );
      this.writeFile(newTodoContent);
    } else {
      throw Error('Todo File Broken');
    }
  }
}
