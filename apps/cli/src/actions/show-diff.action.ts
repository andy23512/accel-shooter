import { getInfoFromArgv } from "../utils";

export async function showDiffAction() {
  const htmlOnly =
    process.argv.includes("-h") || process.argv.includes("--html");
  const pythonOnly =
    process.argv.includes("-p") || process.argv.includes("--python");
  process.argv = process.argv.filter((a) => !a.startsWith("-"));
  const { gitLab, mergeRequest } = await getInfoFromArgv();
  const mergeRequestChanges = await gitLab.getMergeRequestChanges(
    mergeRequest.iid
  );
  const changes = mergeRequestChanges.changes;
  let filteredChanges = [];
  if (htmlOnly) {
    filteredChanges = [
      ...filteredChanges,
      ...changes.filter((c) => c.new_path.endsWith(".html")),
    ];
  }
  if (pythonOnly) {
    filteredChanges = [
      ...filteredChanges,
      ...changes.filter((c) => c.new_path.endsWith(".py")),
    ];
  }
  for (const change of filteredChanges) {
    console.log(`### ${change.new_path}`);
    console.log(change.diff);
  }
}
