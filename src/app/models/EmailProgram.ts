import { Http, Response } from '@angular/http';
import { Program } from 'app/models/Program';
import { ICommand } from 'app/interfaces/ICommand';

export class EmailProgram extends Program {
  private senderName: string;
  private senderEmail: string;
  private senderMessage: string;

  constructor(private http: Http) {
    super('email');
    this.resetInfo();
    super.init(this.genNameCommand());
  }

  public terminate() {
    super.terminate();
    this.resetInfo();
  }

  private resetInfo() {
    this.senderName = '';
    this.senderEmail = '';
    this.senderMessage = '';
  }

  private send() {
    this.http.post('http://localhost:6060/email', {
      name: this.senderName,
      email: this.senderEmail,
      message: this.senderMessage
    }).subscribe(
      _ => console.log('Email successfully sent from server.'),
      (error: any) => console.log(error)
    );
  }

  private genInitCommand(): ICommand {
    return {
      isFinal: false,
      execute: (input) => this.genEmailCommand()
    };
  }

  private genNameCommand(): ICommand {
    return {
      prompt: 'What is your name? ',
      isFinal: false,
      output: (input) => input === this._id ? undefined : 'Nice name.',
      execute: (name) => {
        this.senderName = name;
        return this.genEmailCommand();
      }
    };
  }

  private genEmailCommand(): ICommand {
    return {
      prompt: 'What is your email? ',
      isFinal: false,
      execute: (email) => {
        if (this.isEmail(email)) {
          this.senderEmail = email;
          return this.genMessageCommand();
        } else {
          return this.genEmailCommand();
        }
      },
      output: (email) => this.isEmail(email) ? undefined : 'Invalid email.'
    };
  }

  private genMessageCommand(): ICommand {
    return {
      prompt: 'Enter a message below.',
      output: _ => 'Message stored.',
      isFinal: false,
      isMultilineInput: true,
      execute: (message) => {
        this.senderMessage = message;
        return this.genConfirmCommand();
      }
    };
  };

  private genConfirmCommand(): ICommand {
    return {
      prompt: 'Email ready to go. Send it? (Y/N) ',
      isFinal: false,
      execute: (input) => {
        const response = (input as string).toLowerCase();
        if (response === 'y') {
          this.send();
          return this.genSentCommand();
        }
        if (response === 'n') {
          return this.genDeclinedCommand();
        }
        const repeatCommand: ICommand = this.genConfirmCommand();
        repeatCommand.output = _ => `I didn't catch that. Try 'Y' or 'N'.`;
        return repeatCommand;
      }
    };
  }

  private genSentCommand(): ICommand {
    return {
      isFinal: true,
      output: _ => 'Email sent. :)',
      execute: _ => undefined
    };
  }

  private genDeclinedCommand(): ICommand {
    return {
      isFinal: true,
      output: _ => `Okay. You can always start a new email typing 'email' and pressing Enter.`,
      execute: _ => undefined
    };
  }

  private genErrorCommand(message: string): ICommand {
    return {
      output: _ => message,
      isFinal: true,
      execute:  undefined
    };
  }

  private isEmail(email: string): boolean {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

}
