import { Action } from '../classes/action.class';
import { getInfoFromArgument } from '../utils';

export class ShowDiffAction extends Action {
  public command = 'showDiff';
  public description = 'show diff of files in a task';
  public alias = 'sd';
  public arguments = [
    { name: '[clickUpTaskId]', description: 'optional ClickUp Task Id' },
  ];
  public options = [
    { flags: '-h, --html-only', description: 'show only html diff' },
    { flags: '-p, --python-only', description: 'show only python diff' },
  ];
  public async run(
    clickUpTaskIdArg: string,
    { htmlOnly, pythonOnly }: { htmlOnly: boolean; pythonOnly: boolean }
  ) {
    const { gitLab, mergeRequest } = await getInfoFromArgument(
      clickUpTaskIdArg
    );
    const mergeRequestChanges = await gitLab.getMergeRequestChanges(
      mergeRequest.iid
    );
    const changes = mergeRequestChanges.changes;
    let filteredChanges = [];
    if (htmlOnly) {
      filteredChanges = [
        ...filteredChanges,
        ...changes.filter((c) => c.new_path.endsWith('.html')),
      ];
    }
    if (pythonOnly) {
      filteredChanges = [
        ...filteredChanges,
        ...changes.filter((c) => c.new_path.endsWith('.py')),
      ];
    }
    for (const change of filteredChanges) {
      console.log(`### ${change.new_path}`);
      console.log(change.diff);
    }
  }
}
