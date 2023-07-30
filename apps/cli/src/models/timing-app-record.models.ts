export interface RawTimingAppRecord {
  activityTitle: string;
  activityType: string;
  application: string;
  duration: number;
  startDate: string;
  endDate: string;
  project: string;
  month: string;
  path?: string;
}

export type TimingAppRecord = Omit<
  RawTimingAppRecord,
  'startDate' | 'endDate'
> & {
  startDate: Date;
  endDate: Date;
};
