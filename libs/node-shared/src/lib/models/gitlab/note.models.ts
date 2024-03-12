import { Author } from "./author.models";

export interface Note {
  id: number;
  body: string;
  attachment?: any;
  author: Author;
  created_at: string;
  updated_at: string;
  system: boolean;
  noteable_id: number;
  noteable_type: string;
  project_id: number;
  noteable_iid: number;
  resolvable: boolean;
  confidential: boolean;
  internal: boolean;
}
