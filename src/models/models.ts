export type Site = "ClickUp" | "GitLab";
export type HttpMethod = "get" | "post" | "put" | "delete";
export interface Config {
  ClickUpToken: string;
  GitLabToken: string;
  GitLabProjects: Array<{
    name: string;
    path: string;
    repo: string;
    id: string;
    stagingStatus?: string;
    deployedStatus?: Record<string, string>;
  }>;
  DailyProgressFile: string;
  TrackListFile: string;
  ToDoTemplate: string;
  ToDoConfigChoices: Array<{ name: string; checked: boolean }>;
  EndingAssignee: string;
  SyncIntervalInMinutes: number;
  TrackIntervalInMinutes: number;
  CrossChecklistDefaultSecondLevel: string[];
  ClickUpTeam: string;
}
export type NormalizedChecklist = NormalizedChecklistItem[];
export interface NormalizedChecklistItem {
  name: string;
  checked: boolean;
  order: number;
  id?: string;
}
