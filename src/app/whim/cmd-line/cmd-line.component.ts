import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { IParseResult, IWindowViewWithArgs, WindowViewWithArgs } from '../models';
import { CommandService } from 'app/whim/services/command.service';

@Component({
  selector: 'p3-whim-cmd-line',
  templateUrl: './cmd-line.component.html',
  styleUrls: ['./cmd-line.component.less'],
  providers: [CommandService]
})
export class CommandLineComponent implements OnInit {
  @Output() public switchTo = new EventEmitter<WindowViewWithArgs>();
  @Output() public isActiveSearch = new EventEmitter<boolean>();
  private results: IParseResult[] = [];
  private resultIndex = 0;

  constructor(private commandService: CommandService) { }

  ngOnInit(): void {
    this.commandService.results$.subscribe(results => {
      this.results = results || [];
      this.resultIndex = 0;
    });
  }

  onInput(searchTerm: string): void {
    this.isActiveSearch.emit(!!searchTerm && !!searchTerm.length);
    this.commandService.requests$.next(searchTerm);
  }

  onSelect(choice: IParseResult): void {
    this.switchTo.emit(new WindowViewWithArgs(choice.leadsTo, choice.arguments));
  }

  selectResult(): void {
    if (this.results && this.results.length) {
      this.onSelect(this.results[this.resultIndex]);
    }
  }

  onSelectionUp(event: KeyboardEvent): void {
    event.preventDefault();
    if (this.results && this.resultIndex > 0) {
      this.resultIndex -= 1;
    }
  }

  onSelectionDown(event: KeyboardEvent): void {
    event.preventDefault();
    if (this.results && this.resultIndex < this.results.length - 1) {
      this.resultIndex += 1;
    }
  }
}
