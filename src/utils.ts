import fetch from 'node-fetch';
import { Site, HttpMethod } from './models';
import { CONFIG } from './config';

export function callApiFactory(site: Site) {
  let apiUrl = '';
  let headers: { [key: string]: string } = {};
  switch (site) {
    case 'GitLab':
      apiUrl = 'https://gitlab.com/api/v4';
      headers = { 'Private-Token': CONFIG.GitLabToken };
      break;
    case 'ClickUp':
      apiUrl = 'https://api.clickup.com/api/v2';
      headers = { Authorization: CONFIG.ClickUpToken };
      break;
    default:
      throw Error(`Site {site} is not supported.`);
  }
  return async (method: HttpMethod, url: string, body?: any) {
    return fetch(apiUrl + url, {
      method,
      body: JSON.stringify(body),
      headers
    }).then(res => res.json())
  }
}
