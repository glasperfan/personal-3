import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CookieService } from 'ngx-cookie-service';
import { AppComponent } from './app.component';
import { ROUTES } from './app.routes';
import { FooterComponent } from "./components/footer/footer.component";
import { HomeComponent } from './components/home/home.component';
import { TerminalComponent } from './components/terminal/terminal.component';
import * as ModuleServices from './services';
import { ServerAPI } from './models/ServerApi';
import { environment } from '../environments/environment';
import { UberAPI } from './models/UberApi';
import { FootprintComponent } from './components/footprint/footprint.component';
import { LoadingComponent } from './components/footprint/loading/loading.component';
import { NavbarComponent } from './components/footprint/navbar/navbar.component';
import { RidesComponent } from './components/footprint/rides/rides.component';
import { DashboardComponent } from './components/footprint/dashboard/dashboard.component';

@NgModule({
  imports: [
    HttpModule,
    HttpClientModule,
    BrowserModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    BrowserAnimationsModule,
    FormsModule,
    ROUTES
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    FooterComponent,
    TerminalComponent,
    FootprintComponent,
    LoadingComponent,
    NavbarComponent,
    RidesComponent,
    DashboardComponent
  ],
  providers: [
    CookieService,
    ModuleServices.UberAuthService,
    ModuleServices.UberApiService,
    ModuleServices.RideStatsService,
    ModuleServices.EPAStandardEmissionsService,
    HttpClient,
    { provide: ServerAPI, useValue: new ServerAPI(environment.apiUrl) },
    { provide: UberAPI, useValue: new UberAPI(environment.clientId) }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
