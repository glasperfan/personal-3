import { NgModule, ModuleWithProviders, InjectionToken } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { HttpService } from './services/http.service';
import { PasscodeComponent } from './login/passcode/passcode.component';
import { SignupComponent } from './login/signup/signup.component';
import { LoginComponent } from './login/login/login.component';
import { AddTagsComponent } from './add/tags/tags.component';
import { CommandLineComponent } from './cmd-line/cmd-line.component';
import { CalendarComponent } from './calendar/calendar.component';
import { IdeasComponent } from './ideas/ideas.component';
import { AccountService } from './services/account.service';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AddCalendarEventsComponent } from './add/events/add-events.component';
import { AddFriendsComponent } from './add/friends/add-friends.component';
import { ShowFriendsComponent } from './show/friends/show-friends.component';
import { FriendService } from './services/friend.service';
import { IdeaGeneratorService } from './services/idea-generator.service';
import { StringFieldComponent } from './controls/string-field.component';
import { NotesFieldComponent } from './controls/notes-field.component';
import { DateFormatPipe } from './controls/date.pipe';
import { MarkdownPipe } from './controls/markdown.pipe';
import { Autosize } from 'angular2-autosize/src/autosize.directive';
import { whim_routing } from './whim.routing';
import { WhimComponent } from './whim/whim.component';
import { ServerEndpoint } from '../../server/whim/settings';

// TODO: update for local and prod endpoints
export const API_URL = new InjectionToken<string>('API_URL');

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    whim_routing
  ],
  declarations: [
    WhimComponent,
    DashboardComponent,
    IdeasComponent,
    CalendarComponent,
    CommandLineComponent,
    LoginComponent,
    SignupComponent,
    PasscodeComponent,
    AddFriendsComponent,
    AddCalendarEventsComponent,
    ShowFriendsComponent,
    AddTagsComponent,
    /* Controls */
    StringFieldComponent,
    NotesFieldComponent,
    DateFormatPipe,
    MarkdownPipe,
    Autosize
  ],
  exports: [ ] /* components referenced in RootModule */
})
export class WhimModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: WhimModule,
      providers: [
        FriendService,
        IdeaGeneratorService,
        AccountService,
        HttpService,
        { provide: API_URL, useValue: ServerEndpoint }
      ]
    };
  }
}
