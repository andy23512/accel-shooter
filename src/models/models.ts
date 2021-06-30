export type Site = "ClickUp" | "GitLab";
export type HttpMethod = "get" | "post" | "put" | "delete";
export interface GitLabProject {
  name: string;
  path: string;
  repo: string;
  id: string;
  stagingStatus?: Record<string, string>;
  deployedStatus?: Record<string, string>;
  ignoredCheck?: string[];
  projectType: "full" | "frontend" | "other";
}
export interface Config {
  ClickUpToken: string;
  GitLabToken: string;
  GitLabProjects: GitLabProject[];
  DailyProgressFile: string;
  TrackListFile: string;
  ToDoTemplate: string;
  ToDoConfigChoices: Array<{ name: string; checked: boolean }>;
  EndingAssignee: string;
  SyncIntervalInMinutes: number;
  TrackIntervalInMinutes: number;
  CrossChecklistDefaultSecondLevel: string[];
  ClickUpTeam: string;
  WebPageAlias: Record<string, string>;
}
export type NormalizedChecklist = NormalizedChecklistItem[];
export interface NormalizedChecklistItem {
  name: string;
  checked: boolean;
  order: number;
  id?: string;
}
