/** A command is represented by a unique name (id) and an executor. */
export interface ICommand {
  execute: (input) => ICommand;
  isFinal: boolean;
  output?: (input) => string;
  prompt?: string;
  isMultilineInput?: boolean;
}
