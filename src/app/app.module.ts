import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserModule } from '@angular/platform-browser';
import { CookieService } from 'ngx-cookie-service';
import { AppComponent } from './app.component';
import { ROUTES } from './app.routes';
import { FooterComponent } from "./components/footer/footer.component";
import * as UberEmissions from './components/footprint';
import { HomeComponent } from './components/home/home.component';
import { TerminalComponent } from './components/terminal/terminal.component';
import { TerminalService } from './services/terminal.service';
import { UberApiService } from './services/uber-api.service';
import { UberAuthService } from './services/uber-auth.service';

const UberModules = [
  MatProgressSpinnerModule
];

const UberEmissionsComponents = Object.keys(UberEmissions).map(key => UberEmissions[key]);

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    HttpClientModule,
    ROUTES,
    ...UberModules
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    FooterComponent,
    TerminalComponent,
    ...UberEmissionsComponents
  ],
  providers: [
    TerminalService,
    UberAuthService,
    UberApiService,
    CookieService,
    HttpClient
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
