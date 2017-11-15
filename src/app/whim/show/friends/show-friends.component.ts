import { ShowComponent } from '../show.component';
import { FriendService } from '../../services/friend.service';
import { IError, IFriend } from '../../models';
import { Component, OnInit } from '@angular/core';

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

  protected submitChanges(): void {
    this.friendService.updateFriends([this.args])
      .then(_ => this.toShowMode())
      .catch((e: IError) => {
        console.log(e);
        this.processMessage = `Uh oh! Couldn't save your changes, please let Hugh know.`;
      });
  }

  protected delete(): void {
    // TODO
  }
}
