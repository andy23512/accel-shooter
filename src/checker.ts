import os from "os";
import { GitLab } from "./gitlab";
import { Change, MergeRequest } from "./models/gitlab/merge-request.models";
import { GitLabProject } from "./models/models";
import { promiseSpawn } from "./utils";

type CheckItem = {
  group: string;
  name: string;
  run: (context: {
    mergeRequest: MergeRequest;
    gitLab: GitLab;
    frontendChanges: Change[];
    backendChanges: Change[];
  }) => Promise<{ stdout?: string; stderr?: string; code: number }>;
};

const items: CheckItem[] = [
  {
    group: "Global",
    name: "Check Non-Pushed Changes",
    async run() {
      const result = await promiseSpawn("git", ["status"], "pipe");
      result.code =
        result.stdout.includes("Your branch is up to date with") &&
        result.stdout.includes("nothing to commit, working tree clean")
          ? 0
          : 1;
      return result;
    },
  },
  {
    group: "Global",
    name: "Check Conflict",
    async run({ mergeRequest, gitLab }) {
      const fullMergeRequest = await gitLab.getMergeRequest(mergeRequest.iid);
      const isConflict = fullMergeRequest.has_conflicts;
      return { code: isConflict ? 1 : 0 };
    },
  },
  {
    group: "Frontend",
    name: "Check Lint",
    async run() {
      return promiseSpawn(
        "docker-compose",
        ["exec", "frontend", "yarn", "lint"],
        "pipe"
      );
    },
  },
  {
    group: "Frontend",
    name: "Check Test",
    async run() {
      return promiseSpawn(
        "docker-compose",
        ["exec", "frontend", "yarn", "jest", "--coverage=false"],
        "pipe"
      );
    },
  },
  {
    group: "Frontend",
    name: "Check Prod",
    async run() {
      return promiseSpawn(
        "docker-compose",
        ["exec", "frontend", "yarn", "prod"],
        "pipe"
      );
    },
  },
  {
    group: "Frontend",
    name: "Check console.log",
    async run({ frontendChanges }) {
      return {
        code: frontendChanges.some((c) => c.diff.includes("console.log"))
          ? 1
          : 0,
      };
    },
  },
  {
    group: "Frontend",
    name: "Check long import",
    async run({ frontendChanges }) {
      return {
        code: frontendChanges.some((c) => c.diff.includes("../../")) ? 1 : 0,
      };
    },
  },
  {
    group: "Backend",
    name: "Check Test",
    async run() {
      return promiseSpawn(
        "docker-compose",
        ["exec", "-T", "backend", "pytest", "."],
        "pipe"
      );
    },
  },
  {
    group: "Backend",
    name: "Check print",
    async run({ backendChanges }) {
      return {
        code: backendChanges.some((c) => c.diff.includes("print(")) ? 1 : 0,
      };
    },
  },
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
      runningItems = items.filter((item) => item.group !== "Frontend");
    }
  }
}
