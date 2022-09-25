import { execSync } from 'child_process';
import fuzzy from 'fuzzy';
import inquirer from 'inquirer';
import inquirerAutoCompletePrompt from 'inquirer-autocomplete-prompt';
import { CommitScope } from '../classes/commit-scope.class';
import { promiseSpawn } from '../utils';

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
  const repoName = execSync(
    'basename -s .git `git config --get remote.origin.url`'
  )
    .toString()
    .trim();
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
