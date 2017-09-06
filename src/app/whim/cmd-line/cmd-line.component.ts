import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { IParseResult } from '../models';
import { CommandService } from 'app/whim/services/command.service';

@Component({
  selector: 'p3-whim-cmd-line',
  templateUrl: './cmd-line.component.html',
  styleUrls: ['./cmd-line.component.less'],
  providers: [CommandService]
})
export class CommandLineComponent implements OnInit {
  @Output() public isActiveSearch: EventEmitter<boolean> = new EventEmitter();
  private results: IParseResult[] = [];

  constructor(private commandService: CommandService) { }

  ngOnInit(): void {
    this.commandService.results$.subscribe(results => {
      this.results = results || [];
    });
  }

  onInput(searchTerm: string): void {
    this.isActiveSearch.emit(!!searchTerm && !!searchTerm.length);
    this.commandService.requests$.next(searchTerm);
  }
}
