import { writeFile } from "fs";
import os from "os";
import { combineLatest, concat, defer, interval, of } from "rxjs";
import { map } from "rxjs/operators";
import untildify from "untildify";
import { GitLab } from "./gitlab";
import { Change, MergeRequest } from "./models/gitlab/merge-request.models";
import { GitLabProject } from "./models/models";
import { promiseSpawn } from "./utils";

const SPINNER = [
  "🕛",
  "🕐",
  "🕑",
  "🕒",
  "🕓",
  "🕔",
  "🕕",
  "🕖",
  "🕗",
  "🕘",
  "🕙",
  "🕚",
];

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
    public run: (context: CheckContext) => Promise<{
      stdout?: string;
      stderr?: string;
      code: number;
    }>,
    public stdoutReducer?: (output: string) => string
  ) {}

  public getObs(context: CheckContext) {
    return concat(
      of({
        group: this.group,
        name: this.name,
        code: -1,
        stdout: "",
        stderr: "",
      }),
      defer(() => this.run(context)).pipe(
        map((d: any) => {
          const result: {
            group?: string;
            name?: string;
            code: number;
            stdout?: string;
            stderr?: string;
          } = d;
          result.group = this.group;
          result.name = this.name;
          if (this.stdoutReducer && result.stdout) {
            result.stdout = this.stdoutReducer(result.stdout);
          }
          return result;
        })
      )
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
      ["exec", "-T", "frontend", "yarn", "lint"],
      "pipe"
    );
  }),
  new CheckItem(
    "Frontend",
    "Check Test",
    async () => {
      return promiseSpawn(
        "docker-compose",
        ["exec", "-T", "frontend", "yarn", "jest", "--coverage=false"],
        "pipe"
      );
    },
    (stdout) =>
      stdout
        .split("\n")
        .filter((line) => !line.startsWith("PASS"))
        .join("\n")
  ),
  new CheckItem("Frontend", "Check Prod", async () => {
    return promiseSpawn(
      "docker-compose",
      ["exec", "-T", "frontend", "yarn", "prod"],
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
        code: frontendChanges.some(
          (c) => c.new_path.endsWith(".ts") && c.diff.includes("../../lib/")
        )
          ? 1
          : 0,
      };
    }
  ),
  new CheckItem("Backend", "Check Test (unittest)", async () => {
    return promiseSpawn(
      "docker-compose",
      ["exec", "-T", "backend", "./manage.py", "test"],
      "pipe"
    );
  }),
  new CheckItem("Backend", "Check Test (pytest)", async () => {
    return promiseSpawn(
      "docker-compose",
      ["exec", "-T", "backend", "pytest", "."],
      "pipe"
    );
  }),
  new CheckItem("Backend", "Check Print", async ({ backendChanges }) => {
    return {
      code: backendChanges.some((c) => c.diff.includes("print(")) ? 1 : 0,
    };
  }),
  new CheckItem(
    "Backend",
    "Check Migration Conflict",
    async ({ mergeRequest, backendChanges, gitLab }) => {
      if (!backendChanges.some((c) => c.new_path.includes("migrations"))) {
        return { code: 0 };
      }
      const branchName = mergeRequest.source_branch;
      const defaultBranch = await gitLab.getDefaultBranchName();
      const compare = await gitLab.getCompare(defaultBranch, branchName);
      const migrationDiffs = compare.diffs.filter(
        (d) =>
          (d.new_file || d.deleted_file) && d.new_path.includes("migration")
      );
      const plusFiles = new Set(
        migrationDiffs
          .filter((d) => d.new_file)
          .map((d) => {
            const match = d.new_path.match(/backend\/(\w+)\/migrations\/(\d+)/);
            return match ? match[1] + "_" + match[2] : null;
          })
          .filter(Boolean)
      );
      const minusFiles = new Set(
        migrationDiffs
          .filter((d) => d.deleted_file)
          .map((d) => {
            const match = d.new_path.match(/backend\/(\w+)\/migrations\/(\d+)/);
            return match ? match[1] + "_" + match[2] : null;
          })
          .filter(Boolean)
      );
      return {
        code:
          [...plusFiles].filter((f) => minusFiles.has(f)).length > 0 ? 1 : 0,
      };
    }
  ),
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
    await promiseSpawn("git", ["checkout", mergeRequest.source_branch], "pipe");
    const changes = mergeRequestChanges.changes;
    const frontendChanges = changes.filter((c) =>
      c.new_path.startsWith("frontend")
    );
    const backendChanges = changes.filter((c) =>
      c.new_path.startsWith("backend")
    );
    let runningItems = items;
    if (frontendChanges.length === 0) {
      runningItems = items.filter((item) => item.group !== "Frontend");
    }
    if (backendChanges.length === 0) {
      runningItems = items.filter((item) => item.group !== "Backend");
    }
    if (
      this.gitLabProject.ignoredCheck &&
      this.gitLabProject.ignoredCheck.length > 0
    ) {
      const ignoredCheck = this.gitLabProject.ignoredCheck;
      runningItems = items.filter(
        (item) => !ignoredCheck.includes(`${item.group}/${item.name}`)
      );
    }
    const context = {
      mergeRequest,
      gitLab: this.gitLab,
      frontendChanges,
      backendChanges,
    };
    const obss = runningItems.map((r) => r.getObs(context));
    const checkStream = combineLatest(obss);
    process.stdout.write(runningItems.map((r) => "").join("\n"));
    const s = combineLatest([interval(60), checkStream]).subscribe(
      ([count, statusList]) => {
        process.stdout.moveCursor(0, -statusList.length + 1);
        process.stdout.cursorTo(0);
        process.stdout.clearScreenDown();
        process.stdout.write(
          statusList
            .map((s, index) => {
              let emoji = "";
              switch (s.code) {
                case -1:
                  emoji = SPINNER[count % SPINNER.length];
                  break;
                case 0:
                  emoji = index % 2 === 0 ? "🐰" : "🥕";
                  break;
                case 1:
                  emoji = "❌";
                  break;
                default:
                  emoji = "🔴";
              }
              return `${emoji} [${s.group}] ${s.name}`;
            })
            .join("\n")
        );
        if (statusList.every((s) => s.code !== -1)) {
          s.unsubscribe();
          const nonSuccessStatusList = statusList.filter((s) => s.code !== 0);
          if (nonSuccessStatusList.length > 0) {
            writeFile(
              untildify("~/ac-checker-log"),
              nonSuccessStatusList
                .map(
                  (s) =>
                    `###### [${s.group}] ${s.name} ${s.code}\n${s.stdout}\n${s.stderr}`
                )
                .join("\n\n"),
              () => {}
            );
          }
        }
      }
    );
  }
}
