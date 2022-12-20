import { execSync } from 'child_process';

export async function listDCAction() {
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
