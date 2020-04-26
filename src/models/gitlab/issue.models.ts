export interface Issue {
  project_id: number;
  milestone: Milestone;
  author: Author;
  description: string;
  state: string;
  iid: number;
  assignees: Author[];
  assignee: Author;
  labels: any[];
  upvotes: number;
  downvotes: number;
  merge_requests_count: number;
  id: number;
  title: string;
  updated_at: string;
  created_at: string;
  closed_at?: any;
  closed_by?: any;
  subscribed: boolean;
  user_notes_count: number;
  due_date?: any;
  web_url: string;
  references: References;
  time_stats: TimeStats;
  confidential: boolean;
  discussion_locked: boolean;
  _links: Links;
  task_completion_status: TaskCompletionStatus;
}

interface TaskCompletionStatus {
  count: number;
  completed_count: number;
}

interface Links {
  self: string;
  notes: string;
  award_emoji: string;
  project: string;
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
  state: string;
  web_url: string;
  avatar_url?: any;
  username: string;
  id: number;
  name: string;
}

interface Milestone {
  due_date?: any;
  project_id: number;
  state: string;
  description: string;
  iid: number;
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  closed_at: string;
}
