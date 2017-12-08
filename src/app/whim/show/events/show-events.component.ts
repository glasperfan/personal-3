import { Component, OnInit } from '@angular/core';
import { EventCategory, IError, IEvent, IParsedDate } from '../../models';
import { CalendarService } from '../../services/calendar.service';
import { ShowComponent } from '../show.component';
import { get, set } from 'lodash';

@Component({
  selector: 'p3-whim-show-events',
  templateUrl: './show-events.component.html',
  styleUrls: ['./show-events.component.less']
})
export class ShowEventsComponent extends ShowComponent<IEvent> implements OnInit {
  constructor(private calendarService: CalendarService) { super(); }

  ngOnInit() {
    // Check for birthday
    if (this.args.metadata.type && this.args.metadata.type === EventCategory.Birthday) {
      this.canEdit = false;
    }
  }

  protected update(): void {
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

  private get _title(): string {
    return get(this.args, 'title');
  }

  private set _title(s: string) {
    set(this.args, 'title', s);
  }

  private get _date(): IParsedDate {
    return get(this.args, 'date');
  }

  private set _date(d: IParsedDate) {
    set(this.args, 'date', d);
  }

  private get _description(): string {
    return get(this.args, 'description');
  }

  private set _description(s: string) {
    set(this.args, 'description', s);
  }

  private get _tags(): string[] {
    return get(this.args, 'tags');
  }

  private set _tags(sarr: string[]) {
    set(this.args, 'tags', sarr);
  }
}
