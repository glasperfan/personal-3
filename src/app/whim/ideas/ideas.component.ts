import { IIdea, IUser } from '../models';
import { IdeaGeneratorService } from '../services/idea-generator.service';
import { Component, OnInit } from '@angular/core';
import { v4 } from 'uuid';

@Component({
  selector: 'p3-whim-ideas',
  templateUrl: './ideas.component.html',
  styleUrls: ['./ideas.component.less'],
  providers: [ IdeaGeneratorService ]
})
export class IdeasComponent implements OnInit {
  private readonly MOCK_IDEAS: IIdea[];
  private ideas: IIdea[];
  private todayDate: string;

  constructor() {

    const user: IUser = { id: v4() };
    this.MOCK_IDEAS = [
      {
        id: v4(),
        person: {
          id: v4(),
          first: 'Maddie',
          last: 'Zabriskie',
          userId: user.id,
          wasRemoved: false
        },
        method: {
          name: 'send an email to'
        },
        user: user
      },
      {
        id: v4(),
        person: {
          id: v4(),
          first: 'Kristen',
          last: 'Faulkner',
          userId: user.id,
          wasRemoved: false
        },
        method: {
          name: 'video chat with'
        },
        user: user
      },
      {
        id: v4(),
        person: {
          id: v4(),
          first: 'Preston',
          last: 'Hedrick',
          userId: user.id,
          wasRemoved: false
        },
        method: {
          name: 'send a care package to'
        },
        user: user
      },
      {
        id: v4(),
        person: {
          id: v4(),
          first: 'Forrest',
          last: 'Surles',
          userId: user.id,
          wasRemoved: false
        },
        method: {
          name: 'send a quick message to'
        },
        user: user
      }
    ];

    this.ideas = this.MOCK_IDEAS;
    this.todayDate = this.formatTodayDate();
  }

  ngOnInit() { }

  private formatTodayDate() {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1; // returns a zero-indexed month for reasons beyond me
    const year = today.getFullYear();

    const day_str = day < 10 ? '0' + day.toString() : day.toString();
    const month_str = month < 10 ? '0' + month.toString() : month.toString();
    return `${month_str}/${day_str}/${year}`;
  }
}
