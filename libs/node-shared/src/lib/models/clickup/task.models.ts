import { Assignee } from './assignee.models';
import { Checklist } from './checklist.models';

export interface Task {
  id: string;
  custom_id: string;
  name: string;
  text_content: string;
  description: string;
  status: Status;
  orderindex: string;
  date_created: string;
  date_updated: string;
  date_closed: string;
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
  space: {
    id: string;
  };
  url: string;
  custom_fields?: {
    id: string;
    name: string;
    type: string;
    type_config: any;
    date_created: string;
    hide_from_guests: boolean;
    value: Record<string, any>;
    required: boolean;
  }[];
}

export interface TaskIncludeSubTasks extends Task {
  subtasks: Task[];
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
