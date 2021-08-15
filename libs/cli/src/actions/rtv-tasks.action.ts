import { CONFIG } from '@accel-shooter/node-shared';
import { ClickUp } from '../classes/clickup.class';

export async function RTVTasksAction() {
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
