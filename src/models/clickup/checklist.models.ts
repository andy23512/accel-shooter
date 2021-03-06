import { Assignee } from './assignee.models';

export interface ChecklistResponse {
  checklist: Checklist;
}

export interface Checklist {
  id: string;
  task_id: string;
  name: string;
  date_created: string;
  orderindex: number;
  resolved: number;
  unresolved: number;
  items: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  name: string;
  orderindex: number;
  assignee: Assignee;
  resolved: boolean;
  parent?: any;
  date_created: string;
  children: any[];
}
