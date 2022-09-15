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
  inquirer.registerPrompt('autocomplete', inquirerAutoCompletePrompt);
  const commitScope = new CommitScope();
  const commitScopeItems = commitScope.getItems();
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
  if (!commitScopeItems.includes(scope)) {
    commitScope.addItem(scope);
  }
  const finalScope = scope === 'empty' ? null : scope;
  const message = `${type}${
    finalScope ? '(' + finalScope + ')' : ''
  }: ${subject}`;
  const { stdout, stderr } = await promiseSpawn(
    'git',
    ['commit', '-m', `"${message}"`],
    'pipe'
  );
  if (stderr) {
    console.error(stderr);
  }
  if (stdout) {
    console.log(stdout);
  }
}
