import { IIdea, IUser, WindowView } from '../models';
import { IdeaGeneratorService } from '../services/idea-generator.service';
import { Component, Output, EventEmitter } from '@angular/core';
import { v4 } from 'uuid';

@Component({
  selector: 'p3-whim-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent {

  @Output() switchTo = new EventEmitter<WindowView>();

  private switchToView(view: WindowView): void {
    this.switchTo.emit(view);
  }
}
