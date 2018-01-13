import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full',
  },
  {
    path: 'mela',
    pathMatch: 'full',
    loadChildren: './mela/mela.module#MelaModule'
  }
];

export const ROUTES: ModuleWithProviders = RouterModule.forRoot(routes);
