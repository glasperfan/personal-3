import { FriendService } from '../../services/friend.service';
import { IAddFriendArguments, IError, IFriend, WindowView } from '../../models';
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'p3-whim-add-friends',
  templateUrl: './add-friends.component.html',
  styleUrls: ['./add-friends.component.less']
})
export class AddFriendsComponent implements OnInit {
  @Input() friendInput: IAddFriendArguments;
  @Output() switchTo = new EventEmitter<WindowView>();

  private readonly title = 'Add Friends';
  private readonly description = 'Determine which friends you are focused on building a stronger relationship with. Add them here.';
  private processMessage: string;

  constructor(private friendService: FriendService) { }

  ngOnInit() {
    this.friendInput = this.friendInput || <any>{};
  }

  private toDashboard(): void {
    this.switchTo.emit(WindowView.Dashboard);
  }

  private addFriend(): void {
    // quick validation
    if (!this.friendInput.first || !this.friendInput.first.length
      || !this.friendInput.last || !this.friendInput.last.length) {
      this.processMessage = 'A first and last name is required.';
    } else {
      this.friendService.addFriends([this.friendInput])
        .then((addedFriends: IFriend[]) => {
          this.processMessage = `${addedFriends[0].first} ${addedFriends[0].last}, got it!`;
          this.friendInput = <any>{};
        })
        .catch((err: IError) => this.processMessage = err.errorMessage);
    }
  }
}
