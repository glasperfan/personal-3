import { ShowComponent } from '../show.component';
import { FriendService } from '../../services/friend.service';
import { IError, IFriend, INote } from '../../models';
import { Component, OnInit } from '@angular/core';
import { get, set } from 'lodash';

@Component({
  selector: 'p3-whim-show-friends',
  templateUrl: './show-friends.component.html',
  styleUrls: ['./show-friends.component.less']
})
export class ShowFriendsComponent extends ShowComponent<IFriend> implements OnInit {

  constructor(private friendService: FriendService) { super(); }

  ngOnInit() {
    this.title = this.args.name.displayName;
  }

  protected update(): void {
    this.friendService.updateFriends([this.args])
      .then(updated => {
        if (!updated || !updated.length) {
          this.processMessage = `Uh oh! The friend update went wrong, please let Hugh know.`;
        } else {
          this.title = updated[0].name.displayName;
          this.toShowMode();
        }
      })
      .catch((e: IError) => {
        console.log(e);
        this.processMessage = `Uh oh! Couldn't save your changes, please let Hugh know.`;
      });
  }

  protected delete(): void {
    this.friendService.deleteFriends([this.args])
      .then(_ => {
        this.toDashboard();
      })
      .catch((e: IError) => {
        console.log(e);
        this.processMessage = `Uh oh! Couldn't remove these friends, please let Hugh know. :(`;
      });
  }

  private get _first(): string {
    return get(this.args, 'name.first');
  }

  private set _first(s: string) {
    set(this.args, 'name.first', s);
  }

  private get _last(): string {
    return get(this.args, 'name.last');
  }

  private set _last(s: string) {
    set(this.args, 'name.last', s);
  }

  private get _email(): string {
    return get(this.args, 'email');
  }

  private set _email(s: string) {
    set(this.args, 'email', s);
  }

  private get _phone(): string {
    return get(this.args, 'phone');
  }

  private set _phone(s: string) {
    set(this.args, 'phone', s);
  }

  private get _birthday(): number {
    return get(this.args, 'birthday');
  }

  private set _birthday(n: number) {
    set(this.args, 'birthday', n);
  }

  private get _address1(): string {
    return get(this.args, 'address.address1');
  }

  private set _address1(s: string) {
    set(this.args, 'address.address1', s);
  }

  private get _address2(): string {
    return get(this.args, 'address.address2');
  }

  private set _address2(s: string) {
    set(this.args, 'address.address2', s);
  }

  private get _city(): string {
    return get(this.args, 'address.city');
  }

  private set _city(s: string) {
    set(this.args, 'address.city', s);
  }

  private get _state(): string {
    return get(this.args, 'address.state');
  }

  private set _state(s: string) {
    set(this.args, 'address.state', s);
  }

  private get _country(): string {
    return get(this.args, 'address.country');
  }

  private set _country(s: string) {
    set(this.args, 'address.country', s);
  }

  private get _organization(): string {
    return get(this.args, 'organization');
  }

  private set _organization(s: string) {
    set(this.args, 'organization', s);
  }

  private get _tags(): string[] {
    return get(this.args, 'tags');
  }

  private set _tags(sarr: string[]) {
    set(this.args, 'tags', sarr);
  }

  private get _notes(): INote[] {
    return get(this.args, 'notes');
  }

  private set _notes(n: INote[]) {
    set(this.args, 'notes', n);
  }
}
