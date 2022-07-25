import { Author } from './author.models';
import { Label } from './label.models';
import { References } from './references.models';
import { TimeStats } from './time-stats.models';

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
  labels: Label[];
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

export interface FullMergeRequest {
  id: number;
  iid: number;
  project_id: number;
  title: string;
  description: string;
  state: string;
  created_at: string;
  updated_at: string;
  merged_by?: any;
  merge_user?: any;
  merged_at?: any;
  closed_by?: any;
  closed_at?: any;
  target_branch: string;
  source_branch: string;
  user_notes_count: number;
  upvotes: number;
  downvotes: number;
  author: Author;
  assignees: any[];
  assignee?: any;
  reviewers: any[];
  source_project_id: number;
  target_project_id: number;
  labels: any[];
  draft: boolean;
  work_in_progress: boolean;
  milestone?: any;
  merge_when_pipeline_succeeds: boolean;
  merge_status: string;
  sha: string;
  merge_commit_sha?: any;
  squash_commit_sha?: any;
  discussion_locked?: any;
  should_remove_source_branch?: any;
  force_remove_source_branch: boolean;
  reference: string;
  references: References;
  web_url: string;
  time_stats: Timestats;
  squash: boolean;
  task_completion_status: Taskcompletionstatus;
  has_conflicts: boolean;
  blocking_discussions_resolved: boolean;
  approvals_before_merge?: any;
  subscribed: boolean;
  changes_count: string;
  latest_build_started_at: string;
  latest_build_finished_at?: any;
  first_deployed_to_production_at?: any;
  pipeline: Pipeline;
  head_pipeline: Headpipeline;
  diff_refs: Diffrefs;
  merge_error?: any;
  first_contribution: boolean;
  user: User;
}

interface User {
  can_merge: boolean;
}

interface Diffrefs {
  base_sha: string;
  head_sha: string;
  start_sha: string;
}

interface Headpipeline {
  id: number;
  iid: number;
  project_id: number;
  sha: string;
  ref: string;
  status: string;
  source: string;
  created_at: string;
  updated_at: string;
  web_url: string;
  before_sha: string;
  tag: boolean;
  yaml_errors?: any;
  user: Author;
  started_at: string;
  finished_at: string;
  committed_at?: any;
  duration: number;
  queued_duration: number;
  coverage?: any;
  detailed_status: Detailedstatus;
}

interface Detailedstatus {
  icon: string;
  text: string;
  label: string;
  group: string;
  tooltip: string;
  has_details: boolean;
  details_path: string;
  illustration?: any;
  favicon: string;
}

interface Pipeline {
  id: number;
  iid: number;
  project_id: number;
  sha: string;
  ref: string;
  status: string;
  source: string;
  created_at: string;
  updated_at: string;
  web_url: string;
}

interface Taskcompletionstatus {
  count: number;
  completed_count: number;
}

interface Timestats {
  time_estimate: number;
  total_time_spent: number;
  human_time_estimate?: any;
  human_total_time_spent?: any;
}

export interface MergeRequestChanges {
  id: number;
  iid: number;
  project_id: number;
  title: string;
  state: string;
  created_at: string;
  updated_at: string;
  target_branch: string;
  source_branch: string;
  upvotes: number;
  downvotes: number;
  author: Author;
  assignee: Author;
  assignees: Author[];
  reviewers: Author[];
  source_project_id: number;
  target_project_id: number;
  labels: any[];
  description: string;
  work_in_progress: boolean;
  milestone: Milestone;
  merge_when_pipeline_succeeds: boolean;
  merge_status: string;
  subscribed: boolean;
  sha: string;
  merge_commit_sha?: any;
  squash_commit_sha?: any;
  user_notes_count: number;
  changes_count: string;
  should_remove_source_branch: boolean;
  force_remove_source_branch: boolean;
  squash: boolean;
  web_url: string;
  references: References;
  discussion_locked: boolean;
  time_stats: Timestats;
  task_completion_status: Taskcompletionstatus;
  changes: Change[];
  overflow: boolean;
}

export interface Change {
  old_path: string;
  new_path: string;
  a_mode: string;
  b_mode: string;
  diff: string;
  new_file: boolean;
  renamed_file: boolean;
  deleted_file: boolean;
}

interface Taskcompletionstatus {
  count: number;
  completed_count: number;
}

interface Timestats {
  time_estimate: number;
  total_time_spent: number;
  human_time_estimate?: any;
  human_total_time_spent?: any;
}

interface Milestone {
  id: number;
  iid: number;
  project_id: number;
  title: string;
  description: string;
  state: string;
  created_at: string;
  updated_at: string;
  due_date?: any;
}
