import fs from 'fs';
import { JSONClient } from 'google-auth-library/build/src/auth/googleauth';
import { google } from 'googleapis';

import { authenticate } from '@google-cloud/local-auth';

import { CONFIG } from '../config';

export class Google {
  private readonly scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
  ];
  private tokenFile = CONFIG.GoogleTokenFile;
  private credentialsFile = CONFIG.GoogleCredentialsFile;

  private async loadSavedCredentialsIfExist() {
    try {
      const content = await fs.promises.readFile(this.tokenFile, 'utf-8');
      const credentials = JSON.parse(content);
      return google.auth.fromJSON(credentials);
    } catch (err) {
      return null;
    }
  }

  private async saveCredentials(client: JSONClient) {
    const content = await fs.promises.readFile(this.credentialsFile, 'utf-8');
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
      type: 'authorized_user',
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token,
    });
    await fs.promises.writeFile(this.tokenFile, payload);
  }

  private async authorize() {
    let client = await this.loadSavedCredentialsIfExist();
    if (client) {
      return client;
    }
    client = (await authenticate({
      scopes: this.scopes,
      keyfilePath: this.credentialsFile,
    })) as JSONClient;
    if (client.credentials) {
      await this.saveCredentials(client);
    }
    return client;
  }

  public async listEvent(timeMin: string, timeMax: string) {
    const auth = await this.authorize();
    const calendar = google.calendar({ version: 'v3', auth });
    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin,
      timeMax,
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });
    const events = res.data.items;
    return events;
  }
}
