import { Assignee } from "./assignee.models";
import { Checklist } from "./checklist.models";

export interface Task {
  id: string;
  name: string;
  status: Status;
  orderindex: string;
  date_created: string;
  date_updated: string;
  date_closed?: any;
  creator: Creator;
  assignees: Assignee[];
  checklists: Checklist[];
  tags: any[];
  parent: string;
  priority: null | {
    id: string;
    priority: string;
    color: string;
    orderindex: string;
  };
  due_date: null | string;
  start_date?: any;
  time_estimate?: any;
  time_spent?: any;
  list: List;
  folder: List;
  space: List;
  url: string;
}

interface List {
  id: string;
}

interface Creator {
  id: number;
  username: string;
  color: string;
  profilePicture: string;
}

interface Status {
  status: string;
  color: string;
  orderindex: number;
  type: string;
}
