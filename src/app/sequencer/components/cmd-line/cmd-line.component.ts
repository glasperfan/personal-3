import { Component, ViewChildren, AfterViewInit } from '@angular/core';

export interface Command {
  text: string;
  result: string;
}

export interface User {
  username: string;
}

@Component({
  selector: 'p3-cmd-line',
  templateUrl: './cmd-line.component.html',
  styleUrls: ['./cmd-line.component.less']
})
export class CmdLineComponent implements AfterViewInit {
  @ViewChildren('input') public inputs;

  public cmdHistory: Command[];
  public currentCmd: Command;
  public user: User;
  public prompt: string;

  constructor() {
    this.cmdHistory = [];
    this.currentCmd = { text: '', result: '' };
    this.user = { username: 'hz' };
    this.prompt = this.genPrompt(this.user);
  }

  // Focus on command line input on load.
  ngAfterViewInit(): void {
    this.inputFocus();
  }

  public submit() {
    const oldCmd: Command = Object.assign({}, this.currentCmd);
    this.execute(oldCmd);
    this.cmdHistory.push(oldCmd);
    this.currentCmd.text = '';
  }

  public execute(cmd: Command): void {
    cmd.result = 'Error: command not found';
  }

  public genPrompt(user: User): string {
    return `> \$${user.username} `;
  }

  public inputFocus() {
    this.inputs.first.nativeElement.focus();
  }
}
