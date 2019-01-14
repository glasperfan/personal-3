import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FootprintComponent } from './components/footprint/footprint.component';
import { HomeComponent } from './components/home/home.component';


export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full',
  },
  {
    path: 'footprint',
    component: FootprintComponent,
    pathMatch: 'full'
  }
];

export const ROUTES: ModuleWithProviders = RouterModule.forRoot(routes);
