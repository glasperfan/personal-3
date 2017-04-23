import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { ROUTES } from 'app/app.routes';

import { AppComponent } from './app.component';
import { SequencerComponent } from 'app/sequencer/sequencer/sequencer.component';
import { CmdLineComponent } from './sequencer/cmd-line/cmd-line.component';
import { SidebarComponent } from './sequencer/sidebar/sidebar.component';

@NgModule({
  declarations: [
    AppComponent,
    SequencerComponent,
    CmdLineComponent,
    SidebarComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    ROUTES
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
