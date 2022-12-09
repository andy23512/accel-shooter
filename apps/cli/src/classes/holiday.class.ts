import untildify from 'untildify';

import { CONFIG, IHoliday } from '@accel-shooter/node-shared';

import { add, format } from 'date-fns';
import { BaseFileRef } from './base-file-ref.class';

export class Holiday extends BaseFileRef {
  protected get path() {
    return untildify(CONFIG.HolidayFile);
  }

  private data: IHoliday[];

  constructor() {
    super();
    this.data = JSON.parse(this.readFile());
  }

  public checkIsWorkday(day: Date) {
    const dayString = format(day, 'yyyy/M/d');
    const h = this.data.find((d) => d.date === dayString);
    return (
      !h ||
      (h.isHoliday === '否' && h.name !== '勞動節') ||
      (h.name === '軍人節' && h.holidayCategory === '特定節日')
    );
  }

  public getPreviousWorkday(day: Date): Date {
    let previousDay = add(day, { days: -1 });
    while (!this.checkIsWorkday(previousDay)) {
      previousDay = add(previousDay, { days: -1 });
    }
    return previousDay;
  }
}
