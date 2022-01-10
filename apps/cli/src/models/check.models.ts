import { Change, FullMergeRequest, GitLab } from "@accel-shooter/node-shared";

export interface CheckContext {
  mergeRequest: FullMergeRequest;
  gitLab: GitLab;
  frontendChanges: Change[];
  backendChanges: Change[];
}
