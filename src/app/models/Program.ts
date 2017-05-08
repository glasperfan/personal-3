import { ICommand } from 'app/interfaces/ICommand';

/** A program by a unique name and an initial command. */
export abstract class Program {
  protected static programs: Program[];
  protected _id: string;
  protected entry: ICommand;
  protected _currentNode: ICommand;
  private firstCall: boolean;

  constructor(id: string) {
    this._id = id;
  }

  public get id(): string {
    return this._id;
  }

  public get currentNode(): ICommand {
    return this._currentNode;
  }

  protected init(entry: ICommand) {
    this.entry = entry;
    this.reset();
  }

  public execute(input: any): ICommand {
    if (this.firstCall) {
      this.firstCall = false;
      return this._currentNode;
    }
    const nextCommand = this._currentNode.execute(input);
    this._currentNode = nextCommand;
    return nextCommand;
  }

  public matches(id: string): boolean {
    return id === this._id;
  }

  public terminate(): void {
    this.reset();
  }

  public reset(): void {
    this._currentNode = this.entry;
    this.firstCall = true;
  }
}
