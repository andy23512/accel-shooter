import { CONFIG } from '@accel-shooter/node-shared';
import { writeFileSync } from 'fs';
import fetch from 'node-fetch';

interface IHoliday {
  date: string;
  name: string;
  isHoliday: string;
  holidayCategory: string;
  description: string;
  isMyHoliday?: boolean;
}

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
    .filter(
      (h) =>
        h.isHoliday === '是' ||
        h.holidayCategory === '補行上班日' ||
        h.name === '勞動節'
    )
    .map((h) => ({
      ...h,
      isMyHoliday: true,
    }));
  writeFileSync(CONFIG.HolidayFile, JSON.stringify(holidays, null, 2));
}
