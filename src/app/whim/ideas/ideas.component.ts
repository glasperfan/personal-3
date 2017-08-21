import { AccountService } from '../services/account.service';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { IdeaGeneratorService } from '../services/idea-generator.service';
import { IError, IIdeaSelection, WhimErrorCode } from '../models';

@Component({
  selector: 'p3-whim-ideas',
  templateUrl: './ideas.component.html',
  styleUrls: ['./ideas.component.less']
})
export class IdeasComponent implements OnInit {

  @Input() date: Date;
  @Output() toAddUsers: EventEmitter<void>;
  private readonly todayDateFormatted: string;
  private ideas: Promise<IIdeaSelection[]>;
  private noFriendsAvailable: boolean;

  constructor(private accountService: AccountService, private ideaGenerator: IdeaGeneratorService) {
    this.todayDateFormatted = this.formatTodayDate();
    this.ideas = Promise.resolve([]);
    this.noFriendsAvailable = false;
  }

  ngOnInit() {
    this.date = this.date || new Date();
    this.accountService.currentUser$.then(user => {
      if (user) {
        this.ideas = this.ideaGenerator.getIdeasForDate(user._id, this.date)
          .catch((err: IError) => {
            this.noFriendsAvailable = (<WhimErrorCode>err.errorMessage) === WhimErrorCode.InsufficientFriends;
            return Promise.resolve([]);
          });
      }
    });
  }

  private addUsers(): void {this.toAddUsers.emit(); }

  private formatTodayDate(): string {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1; // returns a zero-indexed month for reasons beyond me
    const year = today.getFullYear();

    const day_str = day < 10 ? '0' + day.toString() : day.toString();
    const month_str = month < 10 ? '0' + month.toString() : month.toString();
    return `${month_str}/${day_str}/${year}`;
  }
}


