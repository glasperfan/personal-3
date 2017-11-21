import { ICalendarManager } from './contracts/ICalendarManager';
import { IUser, ICronSchedule } from '../models';
import { UserManager } from './';
import * as cron from 'cron';
import * as nodemailer from 'nodemailer';
import * as settings from './../app/settings';
const Settings = settings.Settings;
const CronJob = cron.CronJob;

export class EmailManager {
  public readonly SUN_EVENING_CRON_SCHEDULE: ICronSchedule = {
    _id: 'SUN_EVENING',
    name: 'Sunday night',
    time: '00 17 * * SUN'
  };

  public readonly MON_MORNING_CRON_SCHEDULE: ICronSchedule = {
    _id: 'MON_MORNING',
    name: 'Monday morning',
    time: '00 04 * * MON'
  };

  public readonly EVERY_MINUTE_CRON_SCHEDULE: ICronSchedule = {
    _id: 'EVERY_MINUTE',
    name: 'Every minute',
    time: '* * * * *'
  };

  public readonly CRON_SCHEDULES: ICronSchedule[] = [
    // this.SUN_EVENING_CRON_SCHEDULE,
    // this.MON_MORNING_CRON_SCHEDULE,
    this.EVERY_MINUTE_CRON_SCHEDULE
  ];

  private readonly SmtpTransport: nodemailer.Transporter;

  constructor(private userMgr: UserManager, private calendarMgr: ICalendarManager) {
    this.SmtpTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: Settings.Email.usr,
        pass: Settings.Email.pwd
      }
    }, {
        from: `whim.io <${Settings.Email.usr}>`,
        sender: 'whim.io'
    });
  };

  public initiateEmailCronJobs() {
    this.CRON_SCHEDULES.forEach(schedule =>
      this.createWeeklyEmailCronJob(schedule, true, undefined, undefined, true)
    );
    console.log('Email service initialized.');
  }

  private createWeeklyEmailCronJob(schedule: ICronSchedule,
    start: boolean = false,
    timezone: string = 'America/Los_Angeles',
    context: any = undefined,
    runOnInit: boolean = false) {
    return new CronJob(
      schedule.time,
      this.createWeeklyEmailAction(schedule),
      this.emailCronCompletion(schedule),
      start,
      timezone,
      context,
      runOnInit
    );
  }

  private createWeeklyEmailAction(schedule: ICronSchedule) {
    return () => {
      this.getSubscribers(schedule)
        .then(subscribers => {
          this.sendWeeklyEmailTo(subscribers);
        });
    };
  }

  private getSubscribers(schedule: ICronSchedule): Promise<IUser[]> {
    return this.userMgr.getUsersCollection().find(
      // {
      //   'settings.email.weeklyOptIn': true,
      //   'settings.email.weeklySchedule._id': schedule._id
      // }
    ).map(user => this.userMgr.removePasscode(user)).toArray();
  }

  private emailCronCompletion(schedule: ICronSchedule) {
    return () => {
      // TODO: send email
    };
  }

  private sendWeeklyEmailTo(subscribers: IUser[]): void {
    Promise.all(subscribers.map(subscriber =>
      this.SmtpTransport.sendMail(
        // options
        {
          to: `${subscriber.name.displayName} <${subscriber.email}>`,
          subject: 'Hello ✔', // Subject line
          text: 'Hello world ✔', // plaintext body
          html: '<b>Hello world ✔</b>' // html body
        },
        // response handling
        (error: Error, info: nodemailer.SentMessageInfo) => {
          if (error) {
            console.log(`Error sending emails: ${error}`);
          }
          console.log(`
          Total accepted: ${info.accepted.length}
          Total rejected: ${info.rejected.length}`);
        }
      )
    )).then(_ => console.log('Emails sent...'))
      .catch(err => console.log('Uncaught error in email sending', err));
  }
}
