export interface Job {
  commit: Commit;
  coverage?: any;
  allow_failure: boolean;
  created_at: string;
  started_at: string;
  finished_at: string;
  duration: number;
  artifacts_expire_at: string;
  id: number;
  name: string;
  pipeline: Pipeline;
  ref: string;
  artifacts: any[];
  runner?: any;
  stage: string;
  status: string;
  tag: boolean;
  web_url: string;
  user: User;
}

interface User {
  id: number;
  name: string;
  username: string;
  state: string;
  avatar_url: string;
  web_url: string;
  created_at: string;
  bio?: any;
  location?: any;
  public_email: string;
  skype: string;
  linkedin: string;
  twitter: string;
  website_url: string;
  organization: string;
}

interface Pipeline {
  id: number;
  ref: string;
  sha: string;
  status: string;
}

interface Commit {
  author_email: string;
  author_name: string;
  created_at: string;
  id: string;
  message: string;
  short_id: string;
  title: string;
}