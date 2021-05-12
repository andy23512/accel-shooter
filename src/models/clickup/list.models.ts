export interface List {
  id: string;
  name: string;
  orderindex: number;
  content: string;
  status: Status;
  priority: Priority;
  assignee?: any;
  task_count?: any;
  due_date: string;
  due_date_time: boolean;
  start_date?: any;
  start_date_time?: any;
  folder: Folder;
  space: Space;
  statuses: Status2[];
  inbound_address: string;
}

interface Status2 {
  status: string;
  orderindex: number;
  color: string;
  type: string;
}

interface Space {
  id: string;
  name: string;
  access: boolean;
}

interface Folder {
  id: string;
  name: string;
  hidden: boolean;
  access: boolean;
}

interface Priority {
  priority: string;
  color: string;
}

interface Status {
  status: string;
  color: string;
  hide_label: boolean;
}
