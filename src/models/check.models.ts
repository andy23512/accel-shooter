import { GitLab } from "../classes/gitlab.class";
import { MergeRequest } from "./gitlab.models";
import { Change } from "./gitlab/merge-request.models";

export interface CheckContext {
  mergeRequest: MergeRequest;
  gitLab: GitLab;
  frontendChanges: Change[];
  backendChanges: Change[];
}
