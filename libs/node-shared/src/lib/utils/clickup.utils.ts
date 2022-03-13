export function getTaskIdFromBranchName(branchName: string) {
  const result = branchName.match(/CU-([a-z0-9]+)/);
  return result ? result[1] : null;
}
