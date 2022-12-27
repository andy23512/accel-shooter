import fuzzy from 'fuzzy';
import inquirer from 'inquirer';
import inquirerAutoCompletePrompt from 'inquirer-autocomplete-prompt';

import { findBestMatch } from 'string-similarity';
import { CommitScope } from '../classes/commit-scope.class';
import { getInfoFromArgv, getRepoName, promiseSpawn } from '../utils';

const TYPES = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'chore',
  'revert',
];

function preprocess(path: string) {
  const match = path.match(/frontend\/libs\/(.*?)\//);
  if (match) {
    return `frontend/${match[1]}`;
  }
  return path;
}

export async function commitAction() {
  const { mergeRequest } = await getInfoFromArgv(false, true);
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
    .map(preprocess);
  if (stagedFiles.length === 0) {
    console.log('Nothing to commit.');
    return;
  }
  const repoName = getRepoName();
  inquirer.registerPrompt('autocomplete', inquirerAutoCompletePrompt);
  const commitScope = new CommitScope();
  const commitScopeItems = commitScope.getItems(repoName);
  const str =
    stagedFiles.length === 1 ? stagedFiles[0] : getCommon(stagedFiles);
  const bestMatchRatings = findBestMatch(str, commitScopeItems).ratings;
  bestMatchRatings.sort((a, b) => b.rating - a.rating);
  const presortedCommitScopeItems = bestMatchRatings.map((r) => r.target);
  const answers = await inquirer.prompt([
    {
      name: 'type',
      message: 'Enter commit type',
      type: 'autocomplete',
      source: (_: unknown, input = '') => {
        return Promise.resolve(
          fuzzy.filter(input, TYPES).map((t) => t.original)
        );
      },
    },
    {
      name: 'scope',
      message: 'Enter commit scope',
      type: 'autocomplete',
      source: (_: unknown, input = '') => {
        return Promise.resolve(
          fuzzy.filter(input, presortedCommitScopeItems).map((t) => t.original)
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
}

function getCommon(pathList: string[]) {
  const pathArrayList = pathList.map((p) => p.split('/'));
  pathArrayList.sort((a, b) => a.length - b.length);
  let i = 0;
  while (
    i < pathArrayList[0].length &&
    pathArrayList.every((pa) => pa[i] === pathArrayList[0][i])
  ) {
    i++;
  }
  return pathArrayList.slice(undefined, i).join('/');
}
