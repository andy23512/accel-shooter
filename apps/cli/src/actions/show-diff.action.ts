import { getInfoFromArgv } from "../utils";

export async function showDiffAction() {
  const { gitLab, mergeRequest } = await getInfoFromArgv();
  const mergeRequestChanges = await gitLab.getMergeRequestChanges(
    mergeRequest.iid
  );
  const changes = mergeRequestChanges.changes;
  const templateChanges = changes.filter((c) => c.new_path.endsWith(".html"));
  for (const change of templateChanges) {
    console.log(`### ${change.new_path}`);
    console.log(change.diff);
  }
}
