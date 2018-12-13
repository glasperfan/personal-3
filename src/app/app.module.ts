import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { ROUTES } from './app.routes';
import { FooterComponent } from "./components/footer/footer.component";
import { FootprintComponent } from './components/footprint/footprint.component';
import { HomeComponent } from './components/home/home.component';
import { TerminalComponent } from './components/terminal/terminal.component';
import { TerminalService } from './services/terminal.service';
import { UberAuthService } from './services/uber-auth.service';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ROUTES
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    FooterComponent,
    TerminalComponent,
    FootprintComponent
  ],
  providers: [
    TerminalService,
    UberAuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
