import { IIdea, IUser } from '../models';
import { IdeaGeneratorService } from '../services/idea-generator.service';
import { Component } from '@angular/core';
import { v4 } from 'uuid';

@Component({
  selector: 'p3-whim-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent {
}
