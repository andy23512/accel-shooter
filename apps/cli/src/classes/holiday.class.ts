import untildify from 'untildify';

import { CONFIG, IHoliday } from '@accel-shooter/node-shared';

import { format } from 'date-fns';
import { BaseFileRef } from './base-file-ref.class';

export class Holiday extends BaseFileRef {
  protected get path() {
    return untildify(CONFIG.HolidayFile);
  }

  public checkIsWorkday(day: Date) {
    const dayString = format(day, 'yyyy/M/d');
    const holidayData: IHoliday[] = JSON.parse(this.readFile());
    const h = holidayData.find((d) => d.date === dayString);
    if (!h) {
      return true;
    }
    return (
      (h.isHoliday === '否' && h.name !== '勞動節') ||
      (h.name === '軍人節' && h.holidayCategory === '特定節日')
    );
  }
}
