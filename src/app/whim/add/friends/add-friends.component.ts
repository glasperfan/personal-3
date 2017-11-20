import { AddComponent } from '../add.component';
import { FriendService } from '../../services/friend.service';
import { IAddFriendArguments, IError, IFriend, IName, WindowView, WindowViewWithArgs } from '../../models';
import { Component, Input, EventEmitter, Output } from '@angular/core';
import * as moment from 'moment';
import { get, set } from 'lodash';

@Component({
  selector: 'p3-whim-add-friends',
  templateUrl: './add-friends.component.html',
  styleUrls: ['./add-friends.component.less']
})
export class AddFriendsComponent extends AddComponent<IAddFriendArguments> {
  protected readonly title = 'Add Friends';
  protected processMessage: string;

  constructor(private friendService: FriendService) { super(); }

  protected add(): void {
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

  private toEditFriend(friend: IFriend): void {
    this.switchTo.emit(new WindowViewWithArgs(WindowView.ShowFriends, friend));
  }

  private get _first(): string {
    return get(this.args, 'first');
  }

  private set _first(firstName: string) {
    set(this.args, 'first', firstName);
  }

  private get _last(): string {
    return get(this.args, 'last');
  }

  private set _last(lastName: string) {
    set(this.args, 'last', lastName);
  }

  private get _email(): string {
    return get(this.args, 'email');
  }

  private set _email(email: string) {
    set(this.args, 'email', email);
  }

  private get _birthday(): number {
    return get(this.args, 'birthday');
  }

  private set _birthday(birthday: number) {
    set(this.args, 'birthday', birthday);
  }

  private get _address1(): string {
    return get(this.args, 'address1');
  }

  private set _address1(address1: string) {
    set(this.args, 'address1', address1);
  }

  private get _address2(): string {
    return get(this.args, 'address2');
  }

  private set _address2(address2: string) {
    set(this.args, 'address2', address2);
  }

  private get _city(): string {
    return get(this.args, 'city');
  }

  private set _city(city: string) {
    set(this.args, 'city', city);
  }

  private get _state(): string {
    return get(this.args, 'state');
  }

  private set _state(state: string) {
    set(this.args, 'state', state);
  }

  private get _country(): string {
    return get(this.args, 'country');
  }

  private set _country(country: string) {
    set(this.args, 'country', country);
  }

  private get _organization(): string {
    return get(this.args, 'organization');
  }

  private set _organization(organization: string) {
    set(this.args, 'organization', organization);
  }

  private get _firstNote(): string {
    return get(this.args, 'firstNote');
  }

  private set _firstNote(firstNote: string) {
    set(this.args, 'firstNote', firstNote);
  }

  private get _tags(): string[] {
    return get(this.args, 'tags', []);
  }

  private set _tags(tags: string[]) {
    set(this.args, 'tags', tags);
  }
}
