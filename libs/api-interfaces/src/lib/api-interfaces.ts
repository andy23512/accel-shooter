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
  priority: Priority;
  due_date: string;
  original_priority: Priority;
  original_due_date: string;
}
