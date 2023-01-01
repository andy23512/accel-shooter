import { CONFIG } from '@accel-shooter/node-shared';
import clipboardy from 'clipboardy';
import { readFileSync } from 'fs';
import inquirer from 'inquirer';
import { render } from 'mustache';
import untildify from 'untildify';
import { Action } from '../classes/action.class';

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
    const todoConfigMap: Record<string, boolean> = {};
    answers.todoConfig.forEach((c: string) => {
      todoConfigMap[c] = true;
    });
    todoConfigMap[answers.gitLabProject.name] = true;
    const template = readFileSync(untildify(CONFIG.ToDoTemplate), {
      encoding: 'utf-8',
    });
    const endingTodo = render(template, todoConfigMap);
    clipboardy.writeSync(endingTodo);
    console.log(endingTodo);
    console.log('Copied!');
  }
}
