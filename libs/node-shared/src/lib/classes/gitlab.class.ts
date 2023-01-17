import { CONFIG } from '../config';
import { Branch, MergeRequest, Project, User } from '../models/gitlab.models';
import { Commit } from '../models/gitlab/commit.models';
import { Compare } from '../models/gitlab/compare.models';
import { Event } from '../models/gitlab/event.models';
import { Job } from '../models/gitlab/job.models';
import {
  FullMergeRequest,
  MergeRequestChanges,
} from '../models/gitlab/merge-request.models';
import { Pipeline } from '../models/gitlab/pipeline.models';
import { callApiFactory } from '../utils/api.utils';
import { DateFormat, formatDate } from '../utils/date.utils';

const callApi = callApiFactory('GitLab');

export class GitLab {
  constructor(public projectId: string) {}

  public getProject() {
    return callApi<Project>('get', `/projects/${this.projectId}`);
  }

  public async getDefaultBranchName() {
    const project = await this.getProject();
    return project.default_branch;
  }

  public getOpenedMergeRequests() {
    return callApi<MergeRequest[]>(
      'get',
      `/projects/${this.projectId}/merge_requests`,
      { state: 'opened', per_page: '100' }
    );
  }

  public getMergeRequest(mergeRequestNumber: string | number) {
    return callApi<FullMergeRequest>(
      'get',
      `/projects/${this.projectId}/merge_requests/${mergeRequestNumber}`
    );
  }

  public getMergeRequestChanges(mergeRequestNumber: string | number) {
    return callApi<MergeRequestChanges>(
      'get',
      `/projects/${this.projectId}/merge_requests/${mergeRequestNumber}/changes`
    );
  }

  public getCommit(sha: string) {
    return callApi<Commit>(
      'get',
      `/projects/${this.projectId}/repository/commits/${sha}`
    );
  }

  public getEndingAssignee() {
    if (!CONFIG.EndingAssignee) {
      throw Error('No ending assignee was set');
    }
    return callApi<User[]>('get', `/users`, {
      username: CONFIG.EndingAssignee,
    }).then((users) => users[0]);
  }

  public listPipelineJobs(pipelineId: number) {
    return callApi<Job[]>(
      'get',
      `/projects/${this.projectId}/pipelines/${pipelineId}/jobs`
    );
  }

  public getCompare(from: string, to: string) {
    return callApi<Compare>(
      'get',
      `/projects/${this.projectId}/repository/compare`,
      {
        from,
        to,
        straight: true,
      }
    );
  }

  public async listPipelines(query: {
    sha?: string;
    ref?: string;
    status?: string;
    per_page?: number;
  }) {
    query.ref = query.ref || (await this.getDefaultBranchName());
    return callApi<Pipeline[]>(
      'get',
      `/projects/${this.projectId}/pipelines/`,
      query
    );
  }

  public async createBranch(branch: string) {
    return callApi<Branch>(
      'post',
      `/projects/${this.projectId}/repository/branches`,
      null,
      {
        branch,
        ref: await this.getDefaultBranchName(),
      }
    );
  }

  public async createMergeRequest(
    title: string,
    branch: string,
    description: string
  ) {
    return callApi<MergeRequest>(
      'post',
      `/projects/${this.projectId}/merge_requests`,
      null,
      {
        source_branch: branch,
        target_branch: await this.getDefaultBranchName(),
        title: `Draft: ${title}`,
        description,
      }
    );
  }

  public async createMergeRequestNote(
    merge_request: FullMergeRequest | MergeRequest,
    content: string
  ) {
    await callApi(
      'post',
      `/projects/${this.projectId}/merge_requests/${merge_request.iid}/notes`,
      { body: content }
    );
  }

  public async updateMergeRequestDescription(
    merge_request: FullMergeRequest,
    description: string
  ) {
    await callApi(
      'put',
      `/projects/${this.projectId}/merge_requests/${merge_request.iid}`,
      null,
      {
        description,
      }
    );
  }

  public async markMergeRequestAsReadyAndAddAssignee(
    merge_request: FullMergeRequest
  ) {
    const assignee = await this.getEndingAssignee();
    await callApi(
      'put',
      `/projects/${this.projectId}/merge_requests/${merge_request.iid}`,
      null,
      {
        title: merge_request.title
          .replace(/WIP: /g, '')
          .replace(/Draft: /g, ''),
        assignee_id: assignee.id,
      }
    );
  }

  public async closeMergeRequest(merge_request: FullMergeRequest) {
    await callApi(
      'put',
      `/projects/${this.projectId}/merge_requests/${merge_request.iid}`,
      null,
      {
        state_event: 'close',
      }
    );
  }

  public async markMergeRequestAsUnreadyAndSetAssigneeToSelf(
    merge_request: FullMergeRequest
  ) {
    await callApi(
      'put',
      `/projects/${this.projectId}/merge_requests/${merge_request.iid}`,
      null,
      {
        title:
          'Draft: ' +
          merge_request.title.replace('WIP: ', '').replace('Draft: ', ''),
        assignee_id: await this.getUserId(),
      }
    );
  }

  public async getMergeRequestTemplate() {
    const defaultBranchName = await this.getDefaultBranchName();
    return callApi<string>(
      'get',
      `/projects/${this.projectId}/repository/files/%2Egitlab%2Fmerge_request_templates%2FDefault%2Emd/raw`,
      { ref: defaultBranchName },
      undefined,
      true
    );
  }

  public static async getPushedEvents(after: Date, before: Date) {
    return callApi<Event[]>('get', '/events', {
      action: 'pushed',
      before: formatDate(before, DateFormat.GITLAB),
      after: formatDate(after, DateFormat.GITLAB),
      sort: 'asc',
      per_page: 100,
    });
  }

  public static async getApprovedEvents(after: Date, before: Date) {
    return callApi<Event[]>('get', '/events', {
      action: 'approved',
      before: formatDate(before, DateFormat.GITLAB),
      after: formatDate(after, DateFormat.GITLAB),
      sort: 'asc',
      per_page: 100,
    });
  }

  public async fork(namespace_id: number, name: string, path: string) {
    return callApi('post', `/projects/${this.projectId}/fork`, {
      namespace_id,
      name,
      path,
    });
  }

  public static async getNamespaces() {
    return callApi('get', '/namespaces');
  }

  private async getUserId() {
    const user = await callApi<User>('get', '/user');
    return user.id;
  }
}
