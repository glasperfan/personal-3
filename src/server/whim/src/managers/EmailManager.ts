import { ICalendarManager } from './contracts/ICalendarManager';
import { IUser, ICronSchedule, CRON_SCHEDULES } from '../models';
import { UserManager } from './';
import * as cron from 'cron';
const sgMail = require('@sendgrid/mail');
import * as settings from './../app/settings';
const Settings = settings.Settings;
const CronJob = cron.CronJob;

export class EmailManager {

  private readonly SmtpTransport: boolean;

  constructor(private userMgr: UserManager, private calendarMgr: ICalendarManager) {
    // text generator
    // html generator
    // IGenerator (given the data to display, return the text or html display string)
    // data => string
    // sgMail.setApiKey('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');
    // const msg = {
    //   to: 'test@example.com',
    //   from: 'test@example.com',
    //   subject: 'Sending with SendGrid is Fun',
    //   text: 'and easy to do anywhere, even with Node.js',
    //   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    // };
    // sgMail.send(msg);
  };

  public initiateEmailCronJobs() {
    CRON_SCHEDULES.forEach(schedule =>
      this.createWeeklyEmailCronJob(schedule, true, undefined, undefined, false)
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
    // Promise.all(subscribers.map(subscriber =>
    //   this.SmtpTransport.sendMail(
    //     // options
    //     {
    //       to: `${subscriber.name.displayName} <${subscriber.email}>`,
    //       subject: 'Hello ✔', // Subject line
    //       text: 'Hello world ✔', // plaintext body
    //       html: '<b>Hello world ✔</b>' // html body
    //     },
    //     // response handling
    //     (error: Error, info: nodemailer.SentMessageInfo) => {
    //       if (error) {
    //         console.log(`Error sending emails: ${error}`);
    //       }
    //       console.log(`
    //         Total accepted: ${info.accepted.length}
    //         Total rejected: ${info.rejected.length}
    //       `);
    //     }
    //   )
    // )).then(_ => console.log('Emails sent...'))
    //   .catch(err => console.log('Uncaught error in email sending', err));
  }
}
