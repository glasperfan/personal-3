import { Component } from '@angular/core';
import { IEvent, IError } from '../../models';
import { CalendarService } from '../../services/calendar.service';
import { ShowComponent } from '../show.component';

@Component({
  selector: 'p3-whim-show-events',
  templateUrl: './show-events.component.html',
  styleUrls: ['./show-events.component.less']
})
export class ShowEventsComponent extends ShowComponent<IEvent> {
  constructor(private calendarService: CalendarService) { super(); }

  protected submitChanges(): void {
    this.calendarService.updateEvents([this.args])
    .then(_ => this.toShowMode())
    .catch((e: IError) => {
      console.log(e);
      this.processMessage = `Uh oh! Couldn't save your changes, please let Hugh know.`;
    });
  }

  protected delete(): void {
    this.calendarService.deleteEvents([this.args])
      .then(_ => this.toDashboard())
      .catch((e: IError) => {
        console.log(e);
        this.processMessage = `Uh oh! Failed to delete, please let Hugh know.`;
      });
  }
}
