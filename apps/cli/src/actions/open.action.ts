import inquirer from 'inquirer';
import { getGitLabFromArgv, openUrlsInTabGroup } from '../utils';

export async function openAction() {
  const { gitLab, issueNumber } = getGitLabFromArgv();
  const answers = await inquirer.prompt([
    {
      name: 'types',
      message: 'Choose Link Type to open',
      type: 'checkbox',
      choices: [
        { name: 'Issue', value: 'issue' },
        { name: 'Merge Request', value: 'merge-request' },
        { name: 'Task', value: 'task' },
      ],
    },
  ]);
  const issue = await gitLab.getIssue(issueNumber);
  const urls = [];
  for (const type of answers.types) {
    switch (type) {
      case 'issue':
        urls.push(issue.web_url);
        break;
      case 'merge-request':
        const mergeRequests =
          await gitLab.listMergeRequestsWillCloseIssueOnMerge(issueNumber);
        urls.push(mergeRequests[mergeRequests.length - 1].web_url);
        break;
      case 'task':
        const description = issue.description;
        const result = description.match(/https:\/\/app.clickup.com\/t\/\w+/);
        if (result) {
          urls.push(result[0]);
        }
        break;
    }
  }
  openUrlsInTabGroup(urls, issueNumber);
}
