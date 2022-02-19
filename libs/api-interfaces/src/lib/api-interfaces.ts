export interface Priority {
  id: string;
  priority: string;
  color: string;
  orderindex: string;
}

export interface SummarizedTask {
  name: string;
  id: string;
  url: string;
  priority: null | Priority;
  due_date: null | string;
  original_priority: null | Priority;
  original_due_date: null | string;
  date_created: null | string;
}
