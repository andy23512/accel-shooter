export type Site = 'ClickUp' | 'GitLab';
export type HttpMethod = 'get' | 'post' | 'put' | 'delete';
export interface Config {
  ClickUpToken: string;
  GitLabToken: string;
  GitLabProjectMap: {
    [key: string]: string;
  };
  HackMDNoteUrl: string;
}
