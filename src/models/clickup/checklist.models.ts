export interface ChecklistResponse {
  checklist: Checklist;
}

interface Checklist {
  id: string;
  task_id: string;
  name: string;
  date_created: string;
  orderindex: number;
  resolved: number;
  unresolved: number;
  items: Item[];
}

interface Item {
  id: string;
  name: string;
  orderindex: number;
  assignee: Assignee;
  resolved: boolean;
  parent?: any;
  date_created: string;
  children: any[];
}

interface Assignee {
  id: number;
  username: string;
  email: string;
  color: string;
  initials: string;
  profilePicture: string;
}
