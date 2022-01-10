import {
  ClickUp,
  getSyncChecklistActions,
  GitLab,
  normalizeClickUpChecklist,
} from "@accel-shooter/node-shared";
import readline from "readline";
import { endAction } from "./actions/end.action";
import { CustomEmojiProgress } from "./classes/emoji-progress.class";
import {
  getClickUpTaskIdFromGitLabIssue,
  normalizeGitLabIssueChecklist,
  openUrlsInTabGroup,
} from "./utils";

export async function syncChecklist(
  gitLabProjectId: string,
  issueNumber: string,
  ep: CustomEmojiProgress,
  openPage?: boolean
) {
  const gitLab = new GitLab(gitLabProjectId);
  const issue = await gitLab.getIssue(issueNumber);
  const clickUpTaskId = getClickUpTaskIdFromGitLabIssue(issue);
  if (clickUpTaskId) {
    const gitLabChecklistText = issue.description
      .replace(/https:\/\/app.clickup.com\/t\/\w+/g, "")
      .trim();
    const gitLabNormalizedChecklist =
      normalizeGitLabIssueChecklist(gitLabChecklistText);
    const clickUp = new ClickUp(clickUpTaskId);
    const clickUpTask = await clickUp.getTask();
    const mergeRequests = await gitLab.listMergeRequestsWillCloseIssueOnMerge(
      issueNumber
    );
    if (openPage) {
      const frameUrls = await clickUp.getFrameUrls();
      const urls = [
        issue.web_url,
        mergeRequests[mergeRequests.length - 1].web_url,
        clickUpTask.url,
      ];
      if (frameUrls.length) {
        urls.push(frameUrls[0]);
      }
      openUrlsInTabGroup(urls, issueNumber);
    }
    const clickUpChecklistTitle = `GitLab synced checklist [${gitLabProjectId.replace(
      "%2F",
      "/"
    )}]`;
    let clickUpChecklist = clickUpTask.checklists.find(
      (c: any) => c.name === clickUpChecklistTitle
    );
    if (!clickUpChecklist) {
      clickUpChecklist = (await clickUp.createChecklist(clickUpChecklistTitle))
        .checklist;
    }
    const clickUpNormalizedChecklist = normalizeClickUpChecklist(
      clickUpChecklist.items
    );
    const actions = getSyncChecklistActions(
      clickUpNormalizedChecklist,
      gitLabNormalizedChecklist
    );
    const checkedCount = gitLabNormalizedChecklist.filter(
      (item) => item.checked
    ).length;
    const totalCount = gitLabNormalizedChecklist.length;
    ep.setValueAndEndValue(checkedCount, totalCount);
    if (
      actions.update.length + actions.create.length + actions.delete.length ===
      0
    ) {
      return;
    }
    for (const checklistItem of actions.update) {
      await clickUp.updateChecklistItem(
        clickUpChecklist.id,
        checklistItem.id as string,
        checklistItem.name,
        checklistItem.checked,
        checklistItem.order
      );
    }
    for (const checklistItem of actions.create) {
      await clickUp.createChecklistItem(
        clickUpChecklist.id,
        checklistItem.name,
        checklistItem.checked,
        checklistItem.order
      );
    }
    for (const checklistItem of actions.delete) {
      await clickUp.deleteChecklistItem(
        clickUpChecklist.id,
        checklistItem.id as string
      );
    }
  }
}

export function configReadline() {
  readline.emitKeypressEvents(process.stdin);
}

export function setUpSyncHotkey(
  gitLabProjectId: string,
  issueNumber: string,
  ep: CustomEmojiProgress
) {
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on("keypress", async (_, key) => {
    if (key.ctrl && key.name === "c") {
      process.exit();
    } else if (!key.ctrl && !key.meta && !key.shift && key.name === "s") {
      console.log(`You pressed the sync key`);
      syncChecklist(gitLabProjectId, issueNumber, ep);
    } else if (!key.ctrl && !key.meta && !key.shift && key.name === "e") {
      console.log(`You pressed the end key`);
      await syncChecklist(gitLabProjectId, issueNumber, ep);
      await endAction();
      process.exit();
    }
  });
}
