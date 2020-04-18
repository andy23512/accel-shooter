import { callApiFactory } from './utils';

const callApi = callApiFactory('GitLab');

async function getGitLabUserId() {
  const user = await callApi('get', '/user');
  return user.id;
}

export async function getGitLabProject(gitLabProjectId: string) {
  return callApi('get', `/projects/${gitLabProjectId}`);
}

export async function addGitLabIssue(
  gitLabProjectId: string,
  title: string,
  description: string
) {
  return callApi('post', `/projects/${gitLabProjectId}/issues`, {
    title: title,
    description: description,
    assignee_ids: await getGitLabUserId(),
  });
}
