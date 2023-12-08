import { ClickUp } from '@accel-shooter/node-shared';
import kexec from '@jcoreio/kexec';
import { Action } from '../classes/action.class';

import { Todo } from '../classes/todo.class';
import { OpenAction } from './open.action';

export class WorkAction extends Action {
  public command = 'work';
  public description = 'set up work space for first item in todo list';
  public alias = 'wr';
  public async run() {
    const todo = new Todo();
    const todoContent = todo.readFile();
    let matchResult = todoContent.match(/## Todo\n([\s\S]+)\n##/);
    if (!matchResult) {
      throw Error('Todo File Broken');
    }
    const todoList = matchResult[1].split('\n');
    const firstTodo = todoList[0];
    matchResult = firstTodo.match(/https:\/\/app.clickup.com\/t\/(\w+)\)/);
    if (!matchResult) {
      throw Error('First Todo is not a ClickUp task');
    }
    const clickUpTaskId = matchResult[1];
    const clickUp = new ClickUp(clickUpTaskId);
    const { gitLabProject } =
      await clickUp.getGitLabProjectAndMergeRequestIId();
    // Open Task Pages
    await new OpenAction().run(clickUpTaskId);
    // Open tmux
    const folder = gitLabProject.path;
    const shortName = gitLabProject.shortName;
    kexec(
      `cd ${folder}; tmux new -A -d -s ${shortName} -c ${folder}; tmux new -A -D -s ${shortName}`
    );
  }
}
