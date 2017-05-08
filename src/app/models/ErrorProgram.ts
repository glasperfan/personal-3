import { ICommand } from '../interfaces/ICommand';
import { Program } from 'app/models/Program';

export class ErrorProgram extends Program {

  constructor() {
    super('error');
  }

  public execute(_: any): ICommand {
    return {
      output: (input) => `I don't recognize '${input as string}' as a program. Maybe you mean 'email'?`,
      isFinal: true,
      execute: undefined
    };
  }
}
