export interface Commit {
  id: string;
  short_id: string;
  title: string;
  author_name: string;
  author_email: string;
  committer_name: string;
  committer_email: string;
  created_at: string;
  message: string;
  committed_date: string;
  authored_date: string;
  parent_ids: string[];
  last_pipeline: Lastpipeline;
  stats: Stats;
  status: string;
  web_url: string;
}

interface Stats {
  additions: number;
  deletions: number;
  total: number;
}

interface Lastpipeline {
  id: number;
  ref: string;
  sha: string;
  status: string;
}
