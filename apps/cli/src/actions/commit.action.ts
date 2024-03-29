import fuzzy from 'fuzzy';
import inquirer from 'inquirer';
import inquirerAutoCompletePrompt from 'inquirer-autocomplete-prompt';

import path from 'path';
import { Action } from '../classes/action.class';
import { CommitScope } from '../classes/commit-scope.class';
import { getInfoFromArgument, getRepoName, promiseSpawn } from '../utils';
import { GitLabProject } from '@accel-shooter/node-shared';
import { TaskProgressTracker } from '../classes/task-progress-tracker.class';

const TYPES = [
  { name: 'feat', short: 'f' },
  { name: 'fix', short: 'x' },
  { name: 'docs', short: 'd' },
  { name: 'style', short: 's' },
  { name: 'refactor', short: 'r' },
  { name: 'perf', short: 'p' },
  { name: 'test', short: 't' },
  { name: 'build', short: 'b' },
  { name: 'ci', short: 'i' },
  { name: 'chore', short: 'c' },
];

function preprocess(path: string) {
  const match2 = path.match(/libs\/pheno\/(.*?)\//);
  if (match2) {
    return `phe-${match2[1]}`;
  }
  return path;
}

export class CommitAction extends Action {
  public command = 'commit';
  public description = 'commit in convention';
  public alias = 'ci';
  public arguments = [
    { name: '[clickUpTaskId]', description: 'optional ClickUp Task Id' },
  ];
  public async run(clickUpTaskIdArg: string) {
    const { mergeRequest, gitLabProject, clickUpTaskId } =
      await getInfoFromArgument(clickUpTaskIdArg, false, true);
    if (mergeRequest) {
      const title = mergeRequest.title;
      if (!(title.startsWith('WIP: ') || title.startsWith('Draft: '))) {
        console.log('Merge request is ready. Cannot commit.');
        return;
      }
    }
    const stagedFiles = (
      await promiseSpawn('git', ['diff', '--name-only', '--cached'], 'pipe')
    ).stdout
      .trim()
      .split('\n')
      .map(preprocess)
      .filter(Boolean);

    if (stagedFiles.length === 0) {
      console.log('Nothing to commit.');
      return;
    }
    const repoName = getRepoName();
    inquirer.registerPrompt('autocomplete', inquirerAutoCompletePrompt);
    const commitScope = new CommitScope();
    const commitScopeItems = commitScope.getItems(repoName);
    const bestMatchRatings = commitScopeItems.map((scope) => ({
      scope,
      score: getScopeScore(scope, stagedFiles, gitLabProject?.projectType),
    }));
    bestMatchRatings.sort((a, b) => b.score - a.score);
    const presortedCommitScopeItems = bestMatchRatings.map((r) => r.scope);
    const answers = await inquirer.prompt([
      {
        name: 'type',
        message: 'Enter commit type',
        type: 'autocomplete',
        source: (_: unknown, input = '') => {
          return Promise.resolve(
            TYPES.filter((t) => !input || t.short === input).map((t) => t.name)
          );
        },
      },
      {
        name: 'scope',
        message: 'Enter commit scope',
        type: 'autocomplete',
        source: (_: unknown, input = '') => {
          return Promise.resolve(
            fuzzy
              .filter(input, presortedCommitScopeItems)
              .map((t) => t.original)
          );
        },
      },
      {
        name: 'subject',
        message: 'Enter commit subject',
        type: 'input',
      },
    ]);
    const { type, scope, subject } = answers;
    const finalScope = scope === 'empty' ? null : scope;
    const message = `${type}${
      finalScope ? '(' + finalScope + ')' : ''
    }: ${subject}`;
    await promiseSpawn('git', ['commit', '-m', `"${message}"`], 'inherit');
    if (clickUpTaskId) {
      await new TaskProgressTracker().setTime(clickUpTaskId, 'start');
    }
  }
}

function getScopeScore(
  scope: string,
  files: string[],
  projectType: GitLabProject['projectType']
) {
  if (scope === 'empty') {
    return 0;
  }
  return files.reduce((acc: number, file) => {
    const folderPath = path.dirname(file).split('/');
    return (
      acc +
      scope.split('/').reduce((acc, si, i) => {
        if (projectType === 'full' && i === 0) {
          if (si === folderPath[0]) {
            return acc + 100;
          }
          return acc - 100;
        } else {
          const position = folderPath.indexOf(si);
          return acc + position;
        }
      }, 0)
    );
  }, 0);
}
