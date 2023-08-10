import { execSync } from 'child_process';
import { Action } from '../classes/action.class';

export class ListDCAction extends Action {
  public command = 'listDC';
  public description = 'list running docker compose instances';
  public alias = 'ld';
  public async run() {
    const result = execSync(
      `for c in \`docker ps -q\`; do docker inspect $c --format '{{ index .Config.Labels "com.docker.compose.project.working_dir"}} ' ; done`,
      { encoding: 'utf-8' }
    );
    const workDirs = [
      ...new Set(
        result
          .trim()
          .split('\n')
          .map((s) => s.trim())
      ),
    ];
    console.log(workDirs);
  }
}
