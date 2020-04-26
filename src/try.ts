import { GitLab } from './gitlab';
import { textToTree, TreeNode } from './text-to-tree';
import { ClickUp } from './clickup';

(async () => {
  const projectId = 'andy23512%2Fgit-experiment';
  const issueNumber = '20';

  const gitLab = new GitLab(projectId);
  const issue = await gitLab.getIssue(issueNumber);
  const issueDescription: string = issue.description;
  const result = issueDescription.match(/https:\/\/app.clickup.com\/t\/(\w+)/);
  if (result) {
    const clickUpTaskUrl = result[0];
    const clickUpTaskId = result[1];
    const gitLabToDoListText = issueDescription
      .replace(/https:\/\/app.clickup.com\/t\/\w+/g, '')
      .trim();
    const issueChecklistTree = textToTree(gitLabToDoListText);
    const clickUp = new ClickUp(clickUpTaskId);
    const clickUpTasks = await clickUp.getTask();
    let clickUpChecklist = clickUpTasks.checklists.find(
      (c: any) => c.name === 'GitLab synced checklist'
    );
    if (!clickUpChecklist) {
      clickUpChecklist = await clickUp.createCheckList(
        'GitLab synced checklist'
      );
    }
    console.log(clickUpChecklist.items);
    if (clickUpChecklist.items.length === 0) {
      await recursiveCreateChecklistItem(
        clickUp,
        clickUpChecklist,
        issueChecklistTree,
        null
      );
    }
  }
})();

let counter = -1;
async function recursiveCreateChecklistItem(
  clickUp: ClickUp,
  clickUpChecklist: any,
  nodes: TreeNode[],
  parent: any
) {
  for (const node of nodes) {
    counter += 1;
    const parentCheckListItem = await clickUp.createCheckListItem(
      clickUpChecklist.id,
      node.name,
      counter.toString()
    );
    if (node.children.length) {
      recursiveCreateChecklistItem(
        clickUp,
        clickUpChecklist,
        node.children,
        parentCheckListItem
      );
    }
  }
}
