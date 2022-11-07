export interface Event {
  id: number;
  title?: any;
  project_id: number;
  action_name: string;
  target_id?: number;
  target_type?: string;
  author_id: number;
  target_title?: string;
  created_at?: string;
  author: Author;
  author_username: string;
  push_data?: Pushdata;
  note?: Note;
  target_iid?: number;
}

interface Note {
  id: number;
  body: string;
  attachment?: any;
  author: Author;
  created_at: string;
  system: boolean;
  noteable_id: number;
  noteable_type: string;
}

interface Pushdata {
  commit_count: number;
  action: string;
  ref_type: string;
  commit_from: string;
  commit_to: string;
  ref: string;
  commit_title: string;
}

interface Author {
  name: string;
  username: string;
  id: number;
  state: string;
  avatar_url: string;
  web_url: string;
}
