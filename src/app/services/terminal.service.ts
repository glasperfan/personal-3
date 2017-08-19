import { Observable, BehaviorSubject } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { IProgram, IResponse } from 'app/interfaces/IProgram';
import { ICommand } from 'app/interfaces/ICommand';
import { ILog } from 'app/interfaces/ILog';
import { EmailProgram } from 'app/models/EmailProgram';

@Injectable()
export class TerminalService {
  public currentProgram: IProgram;
  public logs: ILog[];
  private prevResponse: IResponse;

  constructor(private http: Http) {
    this.logs = [];
  }

  public get promptPrefix(): string {
    return `$hz ${this.currentProgram ? '[' + this.currentProgram.id + '] ' : ''}> `;
  }

  public execute(originalInput: string): Promise<IResponse> {
    originalInput = originalInput || '';
    const program: IProgram = this.getProgram(originalInput);
    if (!originalInput && !program) {
      this.logLastCommand(originalInput);
      return Promise.resolve(undefined);
    }
    if (!program) {
      const errorResponse: IResponse = {
        isFinal: true,
        message: (input: string) => `Command '${input}' not recognized.`
      };
      this.logLastCommand(originalInput, errorResponse.message(originalInput));
      return Promise.resolve(errorResponse);
    }
    if (this.prevResponse) {
      if (this.prevResponse.validator(originalInput)) {
        this.prevResponse.onSuccess(originalInput);
      } else {
        this.logLastPrompt(originalInput, this.prevResponse);
        return Promise.resolve(this.prevResponse);
      }
    } else {
      this.logLastCommand(originalInput);
      this.currentProgram = program;
    }
    return program.execute(originalInput)
      .then((response: IResponse) => {
        if (response.isFinal) {
          this.logLastPrompt(originalInput, response, this.prevResponse);
          this.currentProgram = undefined;
        } else if (this.prevResponse) {
          this.logLastPrompt(originalInput, this.prevResponse);
        }
        this.prevResponse = response.isFinal ? undefined : response;
        return Promise.resolve(response);
      });
  }

  private getProgram(input: string): IProgram {
    return this.currentProgram ? this.currentProgram : this.getProgramById(input);
  }

  public getProgramById(id: string): IProgram {
    switch (id) {
      case 'email':
        return new EmailProgram(this.http);
      default:
        return undefined;
    }
  }

  private logLastPrompt(lastInput: string, response: IResponse, prevResponse?: IResponse): void {
    let message: string;
    const hasValidator = !!response.message && !!response.validator && !!response.errorMessage;
    if (hasValidator) {
      message = response.validator(lastInput) ? response.message(lastInput) : response.errorMessage(lastInput);
    } else if (response.message) {
      message = response.message(lastInput);
    }
    const prompt: string = prevResponse ? prevResponse.prompt : response.prompt;
    this.logs.push({
      text: this.promptPrefix + prompt + (response.requiresTextarea ? '[text]' : lastInput),
      message: message
    });
  }

  private logLastCommand(lastInput: string, message?: string): void {
    this.logs.push({
      text: this.promptPrefix + lastInput,
      message: message
    });
  }
}
