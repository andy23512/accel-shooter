import { CONFIG } from '@accel-shooter/node-shared';
import clipboardy from 'clipboardy';
import inquirer from 'inquirer';
import { Action } from '../classes/action.class';
import { renderTodoList } from '../utils';

export class TodoAction extends Action {
  public command = 'toDo';
  public description = 'generate todo list';
  public async run() {
    const answers = await inquirer.prompt([
      {
        name: 'gitLabProject',
        message: 'Choose GitLab Project',
        type: 'list',
        choices: CONFIG.GitLabProjects.map((p) => ({
          name: `${p.name} (${p.repo})`,
          value: p,
        })),
      },
      {
        name: 'todoConfig',
        message: 'Choose Preset To-do Config',
        type: 'checkbox',
        choices: CONFIG.ToDoConfigChoices,
      },
    ]);
    const todoList = renderTodoList(
      answers.todoConfig,
      answers.gitLabProject.name
    );
    clipboardy.writeSync(todoList);
    console.log(todoList);
    console.log('Copied!');
  }
}
