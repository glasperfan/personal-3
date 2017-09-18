import { FriendService } from '../../services/friend.service';
import { IError, IField, WindowViewWithArgs } from '../../models';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IFriend, WindowView } from 'app/whim/models';
import { set } from 'lodash';

@Component({
  selector: 'p3-whim-show-friends',
  templateUrl: './show-friends.component.html',
  styleUrls: ['./show-friends.component.less']
})
export class ShowFriendsComponent implements OnInit {

  @Input() args: IFriend;
  @Output() switchTo = new EventEmitter<WindowViewWithArgs>();

  private title: string;
  private description = 'click here to edit';
  private editMode = false;
  private processMessage: string;
  constructor(private friendService: FriendService) { }

  ngOnInit() {
    this.title = this.args.name.displayName;
  }

  private toDashboard(): void {
    this.switchTo.emit(new WindowViewWithArgs(WindowView.Dashboard));
  }

  private updateField(update: IField): void {
    set(this.args, update.field, update.value);
  }

  private submitChanges(): void {
    /* TODO: send changes to the backend */
    this.friendService.updateFriends([this.args])
      .then(_ => this.toShowMode())
      .catch((e: IError) => {
        console.log(e);
        this.processMessage = `Uh oh! Couldn't save your changes, please let Hugh know.`;
      });
  }

  private toEditMode(): void {
    this.editMode = true;
  }

  private toShowMode(): void {
    this.editMode = false;
  }
}
