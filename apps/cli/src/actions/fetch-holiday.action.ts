import { writeFileSync } from 'fs';
import fetch from 'node-fetch';

import { CONFIG, IHoliday } from '@accel-shooter/node-shared';

export async function fetchHolidayAction() {
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
  holidays = holidays
    .filter((h) => h.isHoliday === '是' || h.name === '勞動節')
    .map((h) => ({
      ...h,
      isMyHoliday: true,
    }));
  writeFileSync(CONFIG.HolidayFile, JSON.stringify(holidays, null, 2));
}
