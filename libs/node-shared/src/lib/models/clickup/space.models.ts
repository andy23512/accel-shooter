export interface Space {
  id: string;
  name: string;
  private: boolean;
  statuses: Status[];
  multiple_assignees: boolean;
  features: Features;
}

interface Features {
  due_dates: Duedates;
  time_tracking: Timetracking;
  tags: Timetracking;
  time_estimates: Timetracking;
  checklists: Timetracking;
  custom_fields: Timetracking;
  remap_dependencies: Timetracking;
  dependency_warning: Timetracking;
  portfolios: Timetracking;
}

interface Timetracking {
  enabled: boolean;
}

interface Duedates {
  enabled: boolean;
  start_date: boolean;
  remap_due_dates: boolean;
  remap_closed_due_date: boolean;
}

interface Status {
  status: string;
  type: string;
  orderindex: number;
  color: string;
}
