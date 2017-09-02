import { AddCalendarEventsComponent } from './add/events/add-events.component';
import { AddFriendsComponent } from './add/friends/add-friends.component';
import { NgModule, ModuleWithProviders, InjectionToken } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { HttpService } from './services/http.service';
import { PasscodeComponent } from './login/passcode/passcode.component';
import { SignupComponent } from './login/signup/signup.component';
import { LoginComponent } from './login/login/login.component';
import { AddButtonComponent } from './dashboard/add-btn/add-btn.component';
import { IdeasComponent } from './ideas/ideas.component';
import { CalendarComponent } from './calendar/calendar.component';
import { AccountService } from './services/account.service';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FriendService } from './services/friend.service';
import { IdeaGeneratorService } from './services/idea-generator.service';
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
    AddButtonComponent,
    AddFriendsComponent,
    AddCalendarEventsComponent,
    IdeasComponent,
    CalendarComponent,
    LoginComponent,
    SignupComponent,
    PasscodeComponent
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
