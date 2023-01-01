import { ClickUp, CONFIG } from '@accel-shooter/node-shared';
import { Action } from '../classes/action.class';

export class RTVTasksAction extends Action {
  public command = 'RTVTasks';
  public description = 'list ready to verify tasks';
  public async run() {
    const user = (await ClickUp.getCurrentUser()).user;
    const team = (await ClickUp.getTeams()).teams.find(
      (t) => t.name === CONFIG.ClickUpTeam
    );
    if (!team) {
      console.log('Team does not exist.');
      return;
    }
    const tasks = (await ClickUp.getRTVTasks(team.id, user.id)).tasks;
    console.log(tasks.map((t) => `- ${t.name} (${t.url})`).join('\n'));
  }
}
