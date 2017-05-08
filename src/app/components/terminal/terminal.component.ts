import { Component, OnInit, ViewChildren } from '@angular/core';
import { TerminalService } from 'app/services/terminal.service';
import { Program } from 'app/models/Program';
import { ILog } from 'app/interfaces/ILog';

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
export class TerminalComponent {
  @ViewChildren('input') private inputs;

  constructor(private manager: TerminalService) {}

  private inputFocus() {
    setTimeout(() => this.inputs.first.nativeElement.focus(), 500);
  }
}
