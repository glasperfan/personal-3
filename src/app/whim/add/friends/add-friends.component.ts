import { FriendService } from '../../services/friend.service';
import { IAddFriendArguments, IError, IFriend, IName, WindowView, WindowViewWithArgs } from '../../models';
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'p3-whim-add-friends',
  templateUrl: './add-friends.component.html',
  styleUrls: ['./add-friends.component.less']
})
export class AddFriendsComponent implements OnInit {
  @Input() args: IAddFriendArguments;
  @Output() switchTo = new EventEmitter<WindowViewWithArgs>();

  private readonly title = 'Add Friends';
  private readonly description = 'Determine which friends you are focused on building a stronger relationship with. Add them here.';
  private processMessage: string;

  constructor(private friendService: FriendService) { }

  ngOnInit() {}

  private toDashboard(): void {
    this.switchTo.emit(new WindowViewWithArgs(WindowView.Dashboard));
  }

  private toEditFriend(friend: IFriend): void {
    this.switchTo.emit(new WindowViewWithArgs(WindowView.ShowFriends, friend));
  }

  private addFriend(): void {
    // quick validation
    if (!this.args.first || !this.args.first.length
      || !this.args.last || !this.args.last.length) {
        this.processMessage = 'A first and last name is required.';
      } else {
      this.friendService.addFriends([this.args])
      .then((addedFriends: IFriend[]) => {
        this.processMessage = `${addedFriends[0].name.displayName}, got it!`;
        this.args = <any>{};
        this.toEditFriend(addedFriends[0]);
      })
      .catch((err: IError) => this.processMessage = err.errorMessage);
    }
  }

  private formatDate(date: string, format: string = 'MMMM Do YYYY'): string {
    if (!isNaN(+date)) {
      return moment(date, 'x', true).format(format); // timestamp
    }
    return date;
  }

  private get _first(): string {
    return _.get(this.args, 'first', undefined);
  }

  private set _first(firstName: string) {
    _.set(this.args, 'first', firstName);
  }

  private get _last(): string {
    return _.get(this.args, 'last', undefined);
  }

  private set _last(lastName: string) {
    _.set(this.args, 'last', lastName);
  }

  private get _email(): string {
    return _.get(this.args, 'email', undefined);
  }

  private set _email(email: string) {
    _.set(this.args, 'email', email);
  }

  private get _birthday(): string {
    const value = _.get(this.args, 'birthday', undefined);
    return value ? this.formatDate(value) : undefined;
  }

  private set _birthday(birthday: string) {
    _.set(this.args, 'birthday', birthday);
  }

  private get _address1(): string {
    return _.get(this.args, 'address1', undefined);
  }

  private set _address1(address1: string) {
    _.set(this.args, 'address1', address1);
  }

  private get _address2(): string {
    return _.get(this.args, 'address2', undefined);
  }

  private set _address2(address2: string) {
    _.set(this.args, 'address2', address2);
  }

  private get _city(): string {
    return _.get(this.args, 'city', undefined);
  }

  private set _city(city: string) {
    _.set(this.args, 'city', city);
  }

  private get _state(): string {
    return _.get(this.args, 'state', undefined);
  }

  private set _state(state: string) {
    _.set(this.args, 'state', state);
  }

  private get _country(): string {
    return _.get(this.args, 'country', undefined);
  }

  private set _country(country: string) {
    _.set(this.args, 'country', country);
  }

  private get _organization(): string {
    return _.get(this.args, 'organization', undefined);
  }

  private set _organization(organization: string) {
    _.set(this.args, 'organization', organization);
  }

  private get _firstNote(): string {
    return _.get(this.args, 'firstNote', undefined);
  }

  private set _firstNote(firstNote: string) {
    _.set(this.args, 'firstNote', firstNote);
  }

  private get _tags(): string[] {
    return _.get(this.args, 'tags', []);
  }

  private set _tags(tags: string[]) {
    _.set(this.args, 'tags', tags);
  }
}
