import { Component } from '@angular/core';

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
export class CmdLineComponent {

  private cmdHistory: Command[];
  private currentCmd: Command;
  private user: User;
  private prompt: string;

  constructor() {
    this.cmdHistory = [];
    this.currentCmd = { text: '', result: '' };
    this.user = { username: 'hz' };
    this.prompt = this.genPrompt(this.user);
  }

  private submit() {
    const oldCmd: Command = Object.assign({}, this.currentCmd);
    this.execute(oldCmd);
    this.cmdHistory.push(oldCmd);
    this.currentCmd.text = '';
  }

  private execute(cmd: Command): void {
    cmd.result = 'Error: command not found';
  }

  private genPrompt(user: User): string {
    return `> \$${user.username} `;
  }
}
