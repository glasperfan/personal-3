import { Http } from '@angular/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { IProgram, IResponse } from '../interfaces/IProgram';
import { ServerAPI } from './ServerApi';

export class EmailProgram implements IProgram {
  private senderName: string;
  private senderEmail: string;
  private senderMessage: string;
  private isConfirmed: boolean;

  public readonly id: string;

  constructor(private http: Http, private server: ServerAPI) {
    this.id = 'email';
  }

  execute(input: string): Promise<IResponse> {
    if (this.noDataAcquired() || !this.senderName) {
      return Promise.resolve({
        isFinal: false,
        prompt: 'What is your first name? ',
        message: (name: string) => `Nice name, ${this.capitalize(name)}.`,
        errorMessage: (name: string) => `Try a name with just letters.`,
        validator: this.isLettersAndSpaces,
        onSuccess: (name: string) => this.senderName = name
      });
    }
    if (!this.senderEmail) {
      return Promise.resolve({
        isFinal: false,
        prompt: 'What is your email? ',
        message: (email: string) => `${email}, got it.`,
        errorMessage: (email: string) => `${email} doesn't look like an email to me...`,
        validator: this.isEmail,
        onSuccess: (email: string) => this.senderEmail = email
      });
    }
    if (!this.senderMessage) {
      return Promise.resolve({
        isFinal: false,
        requiresTextarea: true,
        prompt: `Write a message below. `,
        message: _ =>  `Message stored.`,
        errorMessage: _ => `Empty messages not allowed.`,
        validator: (message: string) => !!message.trim().length,
        onSuccess: (message: string) => this.senderMessage = message
      });
    }
    if (this.allDataAcquired() && typeof(this.isConfirmed) === 'undefined') {
      return Promise.resolve({
        isFinal: false,
        prompt: 'Ready to send (Y/N)? ',
        message: _ => undefined,
        errorMessage: _ => `Try 'Y' or 'N'`,
        validator: (res: string) => [ 'y', 'yes', 'n', 'no' ].includes(res.trim().toLowerCase()),
        onSuccess: (res: string) => this.isConfirmed = [ 'y', 'yes' ].includes(res.trim().toLowerCase())
      });
    }
    if (this.allDataAcquired() && this.isConfirmed) {
      return this.send().toPromise();
    }
    if (this.allDataAcquired() && !this.isConfirmed) {
      return Promise.resolve({
        isFinal: true,
        message: _ => `Okay! You can always type 'email' to start over.`
      });
    }
    return undefined;
  }

  private noDataAcquired(): boolean {
    return !this.senderName && !this.senderEmail && !this.senderMessage;
  }

  private allDataAcquired(): boolean {
    return !!this.senderName && !!this.senderEmail && !!this.senderMessage;
  }

  private send(): Observable<IResponse> {
    return this.http.post(this.server.SendEmail, {
      name: this.senderName,
      email: this.senderEmail,
      message: this.senderMessage
    })
    .pipe(
      map(_ => <IResponse>{
        isFinal: true,
        message: __ => 'Email successfully sent :)',
      }),
      catchError(_ => of(<IResponse>{
        isFinal: true,
        message: __ => 'Oh no! Something went wrong... awkward.',
      })));
  }

  private isLettersAndSpaces(name: string): boolean {
    const re = /^[a-zA-Z\s]*$/;
    return re.test(name);
  }

  private isEmail(email: string): boolean {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  private capitalize(str: string): string {
    str = str.trim();
    return str[0].toUpperCase() + str.slice(1);
  }

}
