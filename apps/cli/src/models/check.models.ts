import { GitLab } from "../../../../libs/node-shared/src/lib/classes/gitlab.class";
import { MergeRequest } from "../../../../libs/node-shared/src/lib/models/gitlab.models";
import { Change } from "../../../../libs/node-shared/src/lib/models/gitlab/merge-request.models";

export interface CheckContext {
  mergeRequest: MergeRequest;
  gitLab: GitLab;
  frontendChanges: Change[];
  backendChanges: Change[];
}
