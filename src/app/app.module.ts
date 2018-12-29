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
import * as UberEmissions from './components/footprint';
import { HomeComponent } from './components/home/home.component';
import { TerminalComponent } from './components/terminal/terminal.component';
import * as ModuleServices from './services';
import { ServerAPI } from './models/ServerApi';
import { environment } from '../environments/environment';
import { UberAPI } from './models/UberApi';

const UberModules = [
  MatProgressSpinnerModule,
  MatSelectModule,
  BrowserAnimationsModule
];

const UberEmissionsComponents = Object.keys(UberEmissions).map(key => UberEmissions[key]);
const Services = Object.keys(ModuleServices).map(key => ModuleServices[key]);

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
    CookieService,
    HttpClient,
    { provide: ServerAPI, useValue: new ServerAPI(environment.apiUrl) },
    { provide: UberAPI, useValue: new UberAPI(environment.clientId) },
    ...Services
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
