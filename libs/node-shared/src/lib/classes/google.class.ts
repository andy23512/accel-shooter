import fs from 'fs';
import { JSONClient } from 'google-auth-library/build/src/auth/googleauth';
import { calendar_v3, google } from 'googleapis';

import { authenticate } from '@google-cloud/local-auth';

import { parseISO } from 'date-fns';
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

  public async listAttendingEvent(
    timeMin: string,
    timeMax: string
  ): Promise<(calendar_v3.Schema$Event & { isStudyGroup: boolean })[]> {
    try {
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
      const attendingEvents =
        events
          ?.filter((event) => {
            if (!event.attendees) {
              return true;
            }
            const self = event.attendees.find((a) => a.self);
            return !self || self.responseStatus === 'accepted';
          })
          .map((e) => ({ ...e, isStudyGroup: false })) || [];
      const studyGroupRes = await calendar.events.list({
        calendarId: CONFIG.StudyGroupGoogleCalendarId,
        timeMin,
        timeMax,
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      });
      const studyGroupEvents =
        studyGroupRes.data.items?.map((e) => ({ ...e, isStudyGroup: true })) ||
        [];
      const allEvents = attendingEvents
        .filter((e) => !studyGroupEvents.some((se) => se.id === e.id))
        .concat(studyGroupEvents);
      allEvents.sort((a, b) =>
        a.start?.dateTime && b.start?.dateTime
          ? parseISO(a.start.dateTime).valueOf() -
            parseISO(b.start.dateTime).valueOf()
          : 0
      );
      return allEvents;
    } catch (e: any) {
      if (e.response.data.error === 'invalid_grant') {
        console.log('Invalid Grant!');
        fs.unlinkSync(this.tokenFile);
        return this.listAttendingEvent(timeMin, timeMax);
      } else {
        throw e;
      }
    }
  }
}
