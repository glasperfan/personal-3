import { Observable } from 'rxjs/Rx';
import { ICommand } from 'app/interfaces/ICommand';

export interface IResponse {
  isFinal: boolean,
  prompt?: string,
  requiresTextarea?: boolean
  message?: (input: string) => string,
  errorMessage?: (input: string) => string,
  validator?: (input: string) => boolean,
  onSuccess?: (input: string) => void
}

export interface IProgram {
  id: string;
  execute: (input: string) => Promise<IResponse>;
}
