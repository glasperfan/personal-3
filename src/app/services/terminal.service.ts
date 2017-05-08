import { Observable, BehaviorSubject } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { ProgramService } from 'app/services/program.service';
import { Program } from 'app/models/Program';
import { ICommand } from 'app/interfaces/ICommand';
import { ILog } from 'app/interfaces/ILog';
import { ErrorProgram } from 'app/models/ErrorProgram';

@Injectable()
export class TerminalService {
  public currentProgram: Program;
  private logs: ILog[];
  private prompt: string;
  private response: string;
  private isInputCommand: boolean;

  constructor(private _programService: ProgramService) {
    this.logs = [];
    this.prompt = '';
    this.isInputCommand = true;
  }

  public get promptPrefix(): string {
    return `$hz ${this.currentProgram ? '[' + this.currentProgram.id + '] ' : ''}> `;
  }

  public parse(): void {
    const input = this.response;
    const program: Program = this.getProgram(input);
    const currCommand: ICommand = program.currentNode;
    const nextCommand: ICommand = program.execute(input); // first or next command
    if (nextCommand.isFinal) {
      this.logLastCommand(input, nextCommand.output ? nextCommand.output(input) : '', true);
      this.currentProgram = undefined;
      this.prompt = '';
      this.response = '';
      this.isInputCommand = true;
    } else {
      this.logLastCommand(input, currCommand.output ? currCommand.output(input) : '', false);
      this.currentProgram = program;
      this.prompt = nextCommand.prompt || '';
      this.response = '';
      this.isInputCommand = !nextCommand.isMultilineInput;
    }
  }

  private getProgram(input: string): Program {
    if (this.currentProgram) {
      return this.currentProgram;
    } else {
      const matchingProgram = this._programService.getProgramById(input);
      return matchingProgram ? matchingProgram : new ErrorProgram();
    }
  }

  private logLastCommand(lastInput: string, response: string, isFinal: boolean): void {
    this.logs.push({
      text: this.promptPrefix + this.prompt + (this.isInputCommand ? lastInput : ''),
      response: response
    });
  }
}
