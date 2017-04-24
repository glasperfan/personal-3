import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { ROUTES } from 'app/app.routes';

import { AppComponent } from './app.component';
import { SequencerComponent } from 'app/sequencer/components/sequencer/sequencer.component';
import { CmdLineComponent } from 'app/sequencer/components/cmd-line/cmd-line.component';
import { SidebarComponent } from 'app/sequencer/components/sidebar/sidebar.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    ROUTES
  ],
  declarations: [
    AppComponent,
    SequencerComponent,
    CmdLineComponent,
    SidebarComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
