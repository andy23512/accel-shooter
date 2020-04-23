import { GitLab } from './gitlab';
import markdownIt from 'markdown-it';
import MarkdownIt from 'markdown-it';
import { textToTree } from './text-to-tree';
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
    console.log(textToTree(gitLabToDoListText));
    const clickUp = new ClickUp(clickUpTaskId);
    const clickUpTask = await clickUp.getTaskWithSubTasks();
    console.log(clickUpTask);
  }
})();
