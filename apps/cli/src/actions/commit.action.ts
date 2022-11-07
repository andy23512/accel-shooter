import fuzzy from 'fuzzy';
import inquirer from 'inquirer';
import inquirerAutoCompletePrompt from 'inquirer-autocomplete-prompt';

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

export async function commitAction() {
  const { mergeRequest } = await getInfoFromArgv(false, true);
  if (mergeRequest) {
    const title = mergeRequest.title;
    if (!(title.startsWith('WIP: ') || title.startsWith('Draft: '))) {
      console.log('Merge request is ready. Cannot commit.');
      return;
    }
  }
  const dryRunResult = await promiseSpawn(
    'git',
    ['commit', '--dry-run'],
    'pipe'
  );
  if (dryRunResult.stdout.includes('nothing to commit, working tree clean')) {
    console.log('Nothing to commit.');
    return;
  }
  const repoName = getRepoName();
  inquirer.registerPrompt('autocomplete', inquirerAutoCompletePrompt);
  const commitScope = new CommitScope();
  const commitScopeItems = commitScope.getItems(repoName);
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
          fuzzy.filter(input, commitScopeItems).map((t) => t.original)
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
