import { FriendService } from '../../services/friend.service';
import { IAddFriendArguments, IError, IFriend, WindowView, WindowViewWithArgs } from '../../models';
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'p3-whim-add-friends',
  templateUrl: './add-friends.component.html',
  styleUrls: ['./add-friends.component.less']
})
export class AddFriendsComponent implements OnInit {
  @Input() args: any;
  @Output() switchTo = new EventEmitter<WindowViewWithArgs>();

  private readonly title = 'Add Friends';
  private readonly description = 'Determine which friends you are focused on building a stronger relationship with. Add them here.';
  private processMessage: string;

  constructor(private friendService: FriendService) { }

  ngOnInit() {
    this.args = this.args || {};
    if (this.args.birthday) {
      this.args.birthday = moment(new Date(this.args.birthday)).format('MMMM Do');
    }
  }

  private toDashboard(): void {
    this.switchTo.emit(new WindowViewWithArgs(WindowView.Dashboard));
  }

  private onTagsChange(tags: string[]): void {
    this.args.tags = tags;
  }

  private addFriend(): void {
    // quick validation
    if (!this.args.first || !this.args.first.length
      || !this.args.last || !this.args.last.length) {
      this.processMessage = 'A first and last name is required.';
    } else {
      this.friendService.addFriends([this.args])
        .then((addedFriends: IFriend[]) => {
          this.processMessage = `${addedFriends[0].first} ${addedFriends[0].last}, got it!`;
          this.args = {};
          // TODO: smoother transition here
          // this.toDashboard();
        })
        .catch((err: IError) => this.processMessage = err.errorMessage);
    }
  }
}
