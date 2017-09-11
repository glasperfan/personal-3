import { IIdea, IUser, IWindowViewWithArgs, WindowViewWithArgs } from '../models';
import { IdeaGeneratorService } from '../services/idea-generator.service';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { v4 } from 'uuid';

@Component({
  selector: 'p3-whim-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent {
  @Input() public args;
  @Output() switchTo = new EventEmitter<WindowViewWithArgs>();
  private isActiveSearch = false;

  private switchToView(view: WindowViewWithArgs): void {
    this.switchTo.emit(view);
  }

  private toggleActiveSearch(isActive: boolean) {
    this.isActiveSearch = isActive;
  }
}
