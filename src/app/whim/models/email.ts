export interface ICronSchedule {
  _id: string;
  name: string;
  time: string;
}

export const SUN_EVENING_CRON_SCHEDULE: ICronSchedule = {
  _id: 'SUN_EVENING',
  name: 'Sunday night',
  time: '00 17 * * SUN'
};

export const MON_MORNING_CRON_SCHEDULE: ICronSchedule = {
  _id: 'MON_MORNING',
  name: 'Monday morning',
  time: '00 04 * * MON'
};

export const EVERY_MINUTE_CRON_SCHEDULE: ICronSchedule = {
  _id: 'EVERY_MINUTE',
  name: 'Every minute',
  time: '* * * * *'
};

export const CRON_SCHEDULES: ICronSchedule[] = [
  SUN_EVENING_CRON_SCHEDULE,
  MON_MORNING_CRON_SCHEDULE,
  // EVERY_MINUTE_CRON_SCHEDULE
];

