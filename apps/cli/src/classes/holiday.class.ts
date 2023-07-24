import untildify from 'untildify';

import {
  CONFIG,
  DateFormat,
  formatDate,
  IHoliday,
} from '@accel-shooter/node-shared';

import { add } from 'date-fns';
import { readFileSync } from 'fs';
import { BaseFileRef } from './base-file-ref.class';

export class Holiday extends BaseFileRef {
  private data: IHoliday[];

  protected get path() {
    return untildify(CONFIG.HolidayFile);
  }

  constructor() {
    super();
    this.data = [
      ...JSON.parse(
        readFileSync(untildify(CONFIG.HolidayFile), { encoding: 'utf-8' })
      ),
      ...JSON.parse(
        readFileSync(untildify(CONFIG.PersonalHolidayFile), {
          encoding: 'utf-8',
        })
      ),
    ];
  }

  public checkIsWorkday(day: Date) {
    const dayString = formatDate(day, DateFormat.HOLIDAY);
    const h = this.data.find((d) => d.date === dayString);
    if (day.getMonth() === 4 && day.getDate() === 1) {
      return false;
    }
    return (
      !h ||
      (h.isholiday === '否' && h.name !== '勞動節') ||
      (h.name === '軍人節' && h.holidaycategory === '特定節日')
    );
  }

  public getPreviousWorkday(day: Date): Date {
    let previousDay = add(day, { days: -1 });
    while (!this.checkIsWorkday(previousDay)) {
      previousDay = add(previousDay, { days: -1 });
    }
    return previousDay;
  }

  public getNextWorkday(day: Date): Date {
    let nextDay = add(day, { days: 1 });
    while (!this.checkIsWorkday(nextDay)) {
      nextDay = add(nextDay, { days: 1 });
    }
    return nextDay;
  }
}
