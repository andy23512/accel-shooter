import { GitLabProject } from '@accel-shooter/node-shared';
import { CheckItem } from '../classes/check-item.class';
import { promiseSpawn } from '../utils';

const checkNonPushedChanges = new CheckItem(
  'Global',
  'Check Non-Pushed Changes',
  true,
  async () => {
    const result = await promiseSpawn('git', ['status'], 'pipe');
    result.code =
      result.stdout.includes('Your branch is up to date with') &&
      result.stdout.includes('nothing to commit, working tree clean')
        ? 0
        : 1;
    return result;
  }
);
const checkConflict = new CheckItem(
  'Global',
  'Check Conflict',
  true,
  async ({ mergeRequest, gitLab }) => {
    const fullMergeRequest = await gitLab.getMergeRequest(mergeRequest.iid);
    const isConflict = fullMergeRequest.has_conflicts;
    return { code: isConflict ? 1 : 0 };
  }
);
const checkFrontendLongImportAndConsole = new CheckItem(
  'Frontend',
  'Check long import and console',
  true,
  async ({ frontendChanges }) => {
    return {
      code: frontendChanges.some(
        (c) =>
          c.new_path.endsWith('.ts') &&
          c.diff
            .split('\n')
            .some(
              (line) =>
                !line.startsWith('-') &&
                (line.includes('../../lib/') || line.includes('console.log'))
            )
      )
        ? 1
        : 0,
    };
  }
);
const checkBackendDoubleQuotesAndPrint = new CheckItem(
  'Backend',
  'Check Double Quotes and Print',
  true,
  async ({ backendChanges }) => {
    return {
      code: backendChanges.some(
        (c) =>
          c.new_path.endsWith('.py') &&
          c.diff
            .split('\n')
            .some(
              (line) =>
                !line.startsWith('-') &&
                (line.replace(/"""/g, '').includes('"') ||
                  line.includes('print('))
            )
      )
        ? 1
        : 0,
    };
  }
);
const checkBackendMigrationConflict = new CheckItem(
  'Backend',
  'Check Migration Conflict',
  true,
  async ({ mergeRequest, backendChanges, gitLab }) => {
    if (!backendChanges.some((c) => c.new_path.includes('migrations'))) {
      return { code: 0 };
    }
    const branchName = mergeRequest.source_branch;
    const defaultBranch = await gitLab.getDefaultBranchName();
    const compare = await gitLab.getCompare(defaultBranch, branchName);
    const migrationDiffs = compare.diffs.filter(
      (d) => (d.new_file || d.deleted_file) && d.new_path.includes('migration')
    );
    const plusFiles = new Set(
      migrationDiffs
        .filter((d) => d.new_file)
        .map((d) => {
          const match = d.new_path.match(/backend\/(\w+)\/migrations\/(\d+)/);
          return match ? match[1] + '_' + match[2] : null;
        })
        .filter(Boolean)
    );
    const minusFiles = new Set(
      migrationDiffs
        .filter((d) => d.deleted_file)
        .map((d) => {
          const match = d.new_path.match(/backend\/(\w+)\/migrations\/(\d+)/);
          return match ? match[1] + '_' + match[2] : null;
        })
        .filter(Boolean)
    );
    return {
      code: [...plusFiles].filter((f) => minusFiles.has(f)).length > 0 ? 1 : 0,
    };
  }
);

const fullProjectCheckItems: CheckItem[] = [
  checkNonPushedChanges,
  checkConflict,
  checkFrontendLongImportAndConsole,
  checkBackendDoubleQuotesAndPrint,
  checkBackendMigrationConflict,
];

const frontendProjectCheckItems: CheckItem[] = [
  checkNonPushedChanges,
  checkConflict,
  checkFrontendLongImportAndConsole,
];

const otherProjectCheckItems: CheckItem[] = [
  checkNonPushedChanges,
  checkConflict,
];

export const checkItemsMap: Record<GitLabProject['projectType'], CheckItem[]> =
  {
    full: fullProjectCheckItems,
    frontend: frontendProjectCheckItems,
    other: otherProjectCheckItems,
  };
