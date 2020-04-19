import { callApiFactory, dashify } from './utils';

const callApi = callApiFactory('GitLab');

export function getGitLabBranchNameFromIssueNumberAndTitle(
  issueNumber: number,
  issueTitle: string
) {
  return dashify(`${issueNumber}-${issueTitle}`);
}

export class GitLab {
  constructor(public projectId: string) {}

  public getProject() {
    return callApi('get', `/projects/${this.projectId}`);
  }

  public async getDefaultBranchName() {
    const branches = await this.listBranches();
    return branches.find((b: any) => b.default).name;
  }

  public listProjectLabels() {
    return callApi('get', `/projects/${this.projectId}/labels`);
  }

  public async createIssue(title: string, description: string, labels: any[]) {
    return callApi('post', `/projects/${this.projectId}/issues`, {
      title: title,
      description: description,
      assignee_ids: await this.getUserId(),
      labels: labels.join(','),
    });
  }

  public async createBranch(branch: string) {
    return callApi('post', `/projects/${this.projectId}/repository/branches`, {
      branch,
      ref: await this.getDefaultBranchName(),
    });
  }

  public async createMergeRequest(
    issueNumber: number,
    issueTitle: string,
    branch: string,
    labels: any[]
  ) {
    return callApi('post', `/projects/${this.projectId}/merge_requests`, {
      source_branch: branch,
      target_branch: await this.getDefaultBranchName(),
      title: `WIP: Resolve "${issueTitle}"`,
      description: `Close #${issueNumber}`,
      labels: labels.join(','),
    });
  }

  private async getUserId() {
    const user = await callApi('get', '/user');
    return user.id;
  }

  private listBranches() {
    return callApi('get', `/projects/${this.projectId}/repository/branches`);
  }
}
