import { writeFile } from "fs";
import inquirer from "inquirer";
import os from "os";
import { combineLatest, interval } from "rxjs";
import untildify from "untildify";
import { GitLabProject } from "../models/models";
import { promiseSpawn } from "../utils";
import { checkItemsMap } from "./../consts/check-items.const";
import { Change } from "./../models/gitlab/merge-request.models";
import { CheckItem } from "./check-item.class";
import { GitLab } from "./gitlab.class";

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

export class Checker {
  private gitLabProjectId: string;
  private gitLab: GitLab;

  constructor(
    private gitLabProject: GitLabProject,
    private issueNumber: string,
    private selectMode: boolean
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
    let frontendChanges: Change[] = [];
    let backendChanges: Change[] = [];
    switch (this.gitLabProject.projectType) {
      case "full":
        frontendChanges = changes.filter((c) =>
          c.new_path.startsWith("frontend")
        );
        backendChanges = changes.filter((c) =>
          c.new_path.startsWith("backend")
        );
        break;
      case "frontend":
        frontendChanges = changes;
        break;
    }
    const checkItems = checkItemsMap[this.gitLabProject.projectType];
    const projectCheckItems = (this.gitLabProject.checkItems || []).map(
      CheckItem.fromProjectCheckItem
    );
    let runningItems = [...checkItems, ...projectCheckItems];
    if (frontendChanges.length === 0) {
      runningItems = runningItems.filter((item) => item.group !== "Frontend");
    }
    if (backendChanges.length === 0) {
      runningItems = runningItems.filter((item) => item.group !== "Backend");
    }
    if (this.selectMode) {
      const answers = await inquirer.prompt([
        {
          name: "selectedCheckItems",
          message: "Choose Check Items to Run",
          type: "checkbox",
          choices: runningItems.map((r) => ({
            name: r.displayName,
            checked: r.defaultChecked,
          })),
          pageSize: runningItems.length,
        },
      ]);
      runningItems = runningItems.filter((r) =>
        answers.selectedCheckItems.includes(r.displayName)
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
          console.log("");
        }
      }
    );
  }
}
