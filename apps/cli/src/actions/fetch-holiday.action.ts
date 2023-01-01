import fetch from 'node-fetch';

import { IHoliday } from '@accel-shooter/node-shared';

import { Action } from '../classes/action.class';
import { Holiday } from '../classes/holiday.class';

export class FetchHolidayAction extends Action {
  public command = 'fetchHoliday';
  public description = 'fetch holiday data from api';
  public async run() {
    let page = 0;
    let holidays: IHoliday[] = [];
    let data = null;
    while (data === null || data.length !== 0) {
      const response = await fetch(
        `https://data.ntpc.gov.tw/api/datasets/308DCD75-6434-45BC-A95F-584DA4FED251/json?page=${page}&size=1000`
      );
      data = await response.json();
      holidays = [...holidays, ...data];
      page += 1;
    }
    new Holiday().writeFile(JSON.stringify(holidays, null, 2));
  }
}
