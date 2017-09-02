import { WindowView } from '../../models';
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'p3-whim-add-btn',
  template: `
    <div class="whim-btn hover-flicker" (click)="toggleOptions()">Add</div>
    <div class="btn-overlay" *ngIf="showOptions">
      <ul class="add-options">
        <li class="hover-flicker" (click)="addFriends()">Friend</li>
        <li class="hover-flicker" (click)="addEvents()">Event</li>
      </ul>
    </div>
    `,
  styleUrls: ['add-btn.component.less']
})
export class AddButtonComponent {
  @Output() switchTo = new EventEmitter<WindowView>();
  private showOptions = false;

  private toggleOptions() {
    this.showOptions = !this.showOptions;
  }

  private addFriends() {
    this.showOptions = false;
    this.switchTo.emit(WindowView.AddFriends);
  }

  private addEvents() {
    this.showOptions = false;
    this.switchTo.emit(WindowView.AddEvents);
  }
}
