import {
  Branch,
  Issue,
  Label,
  MergeRequest,
  Project,
  User,
} from './models/gitlab.models';
import { Commit } from './models/gitlab/commit.models';
import { FullMergeRequest } from './models/gitlab/merge-request.models';
import { callApiFactory, dashify } from './utils';

const callApi = callApiFactory('GitLab');

export function getGitLabBranchNameFromIssueNumberAndTitleAndTaskId(
  issueNumber: number,
  issueTitle: string,
  clickUpTaskId: string
) {
  return `${issueNumber}_CU-${clickUpTaskId}_${dashify(issueTitle)}`;
}

export class GitLab {
  constructor(public projectId: string) {}

  public getProject() {
    return callApi<Project>('get', `/projects/${this.projectId}`);
  }

  public async getDefaultBranchName() {
    const project = await this.getProject();
    return project.default_branch;
  }

  public getIssue(issueNumber: string) {
    return callApi<Issue>(
      'get',
      `/projects/${this.projectId}/issues/${issueNumber}`
    );
  }

  public getMergeRequest(mergeRequestNumber: string | number) {
    return callApi<FullMergeRequest>(
      'get',
      `/projects/${this.projectId}/merge_requests/${mergeRequestNumber}`
    );
  }

  public getCommit(sha: string) {
    console.log(sha);
    return callApi<Commit>(
      'get',
      `/projects/${this.projectId}/repository/commits/${sha}`
    );
  }

  public listProjectLabels() {
    return callApi<Label[]>(
      'get',
      `/projects/${this.projectId}/labels?per_page=100`
    );
  }

  public listMergeRequestsWillCloseIssueOnMerge(issueNumber: string) {
    return callApi<MergeRequest[]>(
      'get',
      `/projects/${this.projectId}/issues/${issueNumber}/closed_by`
    );
  }

  public async createIssue(title: string, description: string, labels: any[]) {
    return callApi<Issue>('post', `/projects/${this.projectId}/issues`, {
      title: title,
      description: description,
      assignee_ids: await this.getUserId(),
      labels: labels.join(','),
    });
  }

  public async createBranch(branch: string) {
    return callApi<Branch>(
      'post',
      `/projects/${this.projectId}/repository/branches`,
      {
        branch,
        ref: await this.getDefaultBranchName(),
      }
    );
  }

  public async createMergeRequest(
    issueNumber: number,
    issueTitle: string,
    branch: string,
    labels: any[]
  ) {
    return callApi<MergeRequest>(
      'post',
      `/projects/${this.projectId}/merge_requests`,
      {
        source_branch: branch,
        target_branch: await this.getDefaultBranchName(),
        title: `Draft: Resolve "${issueTitle}"`,
        description: `Close #${issueNumber}`,
        labels: labels.join(','),
      }
    );
  }

  private async getUserId() {
    const user = await callApi<User>('get', '/user');
    return user.id;
  }
}
