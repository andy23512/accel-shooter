import { format } from 'date-fns';

export enum DateFormat {
  STANDARD = 'yyyy/MM/dd',
  GITLAB = 'yyyy-MM-dd',
  HOLIDAY = 'yyyy/M/d',
  TIMING_APP = 'yyyy/M/d',
}

export function formatDate(
  day: Date,
  dateFormat: DateFormat = DateFormat.STANDARD
) {
  return format(day, dateFormat);
}
