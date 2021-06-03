export interface Compare {
  commit: Commit;
  commits: Commit[];
  diffs: Diff[];
  compare_timeout: boolean;
  compare_same_ref: boolean;
}

interface Diff {
  old_path: string;
  new_path: string;
  a_mode?: any;
  b_mode: string;
  diff: string;
  new_file: boolean;
  renamed_file: boolean;
  deleted_file: boolean;
}

interface Commit {
  id: string;
  short_id: string;
  title: string;
  author_name: string;
  author_email: string;
  created_at: string;
}
