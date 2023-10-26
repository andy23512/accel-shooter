export interface Approval {
  id: number;
  iid: number;
  project_id: number;
  title: string;
  description: string;
  state: string;
  created_at: string;
  updated_at: string;
  merge_status: string;
  approvals_required: number;
  approvals_left: number;
  approved_by: Approvedby[];
}

interface Approvedby {
  user: User;
}

interface User {
  name: string;
  username: string;
  id: number;
  state: string;
  avatar_url: string;
  web_url: string;
}
