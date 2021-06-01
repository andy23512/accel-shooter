import os from "os";
import { concat, defer, of } from "rxjs";
import { GitLab } from "./gitlab";
import { Change, MergeRequest } from "./models/gitlab/merge-request.models";
import { GitLabProject } from "./models/models";
import { promiseSpawn } from "./utils";

interface CheckContext {
  mergeRequest: MergeRequest;
  gitLab: GitLab;
  frontendChanges: Change[];
  backendChanges: Change[];
}

class CheckItem {
  constructor(
    public group: string,
    public name: string,
    public run: (
      context: CheckContext
    ) => Promise<{ stdout?: string; stderr?: string; code: number }>
  ) {}

  public getObs(context: CheckContext) {
    return concat(
      of({ code: -1 }),
      defer(() => this.run(context))
    );
  }
}

const items: CheckItem[] = [
  new CheckItem("Global", "Check Non-Pushed Changes", async () => {
    const result = await promiseSpawn("git", ["status"], "pipe");
    result.code =
      result.stdout.includes("Your branch is up to date with") &&
      result.stdout.includes("nothing to commit, working tree clean")
        ? 0
        : 1;
    return result;
  }),
  new CheckItem(
    "Global",
    "Check Conflict",
    async ({ mergeRequest, gitLab }) => {
      const fullMergeRequest = await gitLab.getMergeRequest(mergeRequest.iid);
      const isConflict = fullMergeRequest.has_conflicts;
      return { code: isConflict ? 1 : 0 };
    }
  ),
  new CheckItem("Frontend", "Check Lint", async () => {
    return promiseSpawn(
      "docker-compose",
      ["exec", "frontend", "yarn", "lint"],
      "pipe"
    );
  }),
  new CheckItem("Frontend", "Check Test", async () => {
    return promiseSpawn(
      "docker-compose",
      ["exec", "frontend", "yarn", "jest", "--coverage=false"],
      "pipe"
    );
  }),
  new CheckItem("Frontend", "Check Prod", async () => {
    return promiseSpawn(
      "docker-compose",
      ["exec", "frontend", "yarn", "prod"],
      "pipe"
    );
  }),
  new CheckItem(
    "Frontend",
    "Check console.log",
    async ({ frontendChanges }) => {
      return {
        code: frontendChanges.some((c) => c.diff.includes("console.log"))
          ? 1
          : 0,
      };
    }
  ),
  new CheckItem(
    "Frontend",
    "Check long import",
    async ({ frontendChanges }) => {
      return {
        code: frontendChanges.some((c) => c.diff.includes("../../")) ? 1 : 0,
      };
    }
  ),
  new CheckItem("Backend", "Check Test", async () => {
    return promiseSpawn(
      "docker-compose",
      ["exec", "-T", "backend", "pytest", "."],
      "pipe"
    );
  }),
  new CheckItem("Backend", "Check print", async ({ backendChanges }) => {
    return {
      code: backendChanges.some((c) => c.diff.includes("print(")) ? 1 : 0,
    };
  }),
];

export class Checker {
  private gitLabProjectId: string;
  private gitLab: GitLab;

  constructor(
    private gitLabProject: GitLabProject,
    private issueNumber: string
  ) {
    this.gitLabProjectId = this.gitLabProject.id;
    this.gitLab = new GitLab(this.gitLabProjectId);
  }

  public async start() {
    const mergeRequests =
      await this.gitLab.listMergeRequestsWillCloseIssueOnMerge(
        this.issueNumber
      );
    const mergeRequest = mergeRequests[mergeRequests.length - 1];
    const mergeRequestChanges = await this.gitLab.getMergeRequestChanges(
      mergeRequest.iid
    );
    process.chdir(this.gitLabProject.path.replace("~", os.homedir()));
    await promiseSpawn("git", ["checkout", mergeRequest.source_branch]);
    const changes = mergeRequestChanges.changes;
    const frontendChanges = changes.filter(
      (c) =>
        c.old_path.startsWith("frontend") || c.new_path.startsWith("frontend")
    );
    const backendChanges = changes.filter(
      (c) =>
        c.old_path.startsWith("backend") || c.new_path.startsWith("backend")
    );
    let runningItems = items;
    if (frontendChanges.length === 0) {
      runningItems = items.filter((item) => item.group !== "Frontend");
    }
    if (backendChanges.length === 0) {
      runningItems = items.filter((item) => item.group !== "Backend");
    }
    const context = {
      mergeRequest,
      gitLab: this.gitLab,
      frontendChanges,
      backendChanges,
    };
  }
}
