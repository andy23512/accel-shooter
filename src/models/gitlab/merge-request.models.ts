export interface MergeRequest {
  id: number;
  iid: number;
  project_id: number;
  title: string;
  description: string;
  state: string;
  created_at: string;
  updated_at: string;
  target_branch: string;
  source_branch: string;
  upvotes: number;
  downvotes: number;
  author: Author;
  assignee?: any;
  source_project_id: number;
  target_project_id: number;
  closed_at?: any;
  closed_by?: any;
  labels: any[];
  work_in_progress: boolean;
  milestone?: any;
  merge_when_pipeline_succeeds: boolean;
  merge_status: string;
  sha: string;
  merge_commit_sha?: any;
  squash_commit_sha?: any;
  user_notes_count: number;
  should_remove_source_branch?: any;
  force_remove_source_branch: boolean;
  web_url: string;
  reference: string;
  references: References;
  time_stats: TimeStats;
}

interface TimeStats {
  time_estimate: number;
  total_time_spent: number;
  human_time_estimate?: any;
  human_total_time_spent?: any;
}

interface References {
  short: string;
  relative: string;
  full: string;
}

interface Author {
  name: string;
  username: string;
  id: number;
  state: string;
  avatar_url: string;
  web_url: string;
}
