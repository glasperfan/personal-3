import { Component, OnInit, ViewChildren, AfterViewInit } from '@angular/core';
import { TerminalService } from 'app/services/terminal.service';
import { ILog } from 'app/interfaces/ILog';
import { IResponse } from 'app/interfaces/IProgram';

/**
 * Email commands:
 * email
 * What is your name? Hugh Zabriskie
 * What is your email? hugh.zabriskie@gmail.com
 * Enter a message below? Press the submit button to finish.
 * Are you ready to send? (Y/N) Y
 * -> Y: Sent! Explore the code to find other interesting commands... :)
 * -> N: Okay. You can start over by running 'email' again.
 */
@Component({
  selector: 'p3-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.less'],
  providers: [ TerminalService ]
})
export class TerminalComponent implements AfterViewInit {
  @ViewChildren('input') public inputs;
  public response: IResponse;
  public input: string;

  constructor(public manager: TerminalService) {
    this.input = '';
  }

  ngAfterViewInit() {
    this.inputFocus();
  }

  public get logs(): ILog[] {
    return this.manager.logs;
  }

  public get promptPrefix(): string {
    return this.manager.promptPrefix;
  }

  public execute(): void {
    if (this.response) {
      this.response.requiresTextarea = false; // clear for inputFocus()
    }
    this.manager.execute(this.input).then((response: IResponse) => {
      this.response = Object.assign({}, response);
      this.input = '';
      this.inputFocus();
    });
  }

  public inputFocus() {
    if (this.inputs.first) {
      setTimeout(() => this.inputs.first.nativeElement.focus(), 500);
    }
  }
}
