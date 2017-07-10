import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { WhimModule } from './whim/whim.module';
import { SequencerComponent } from 'app/sequencer/components/sequencer/sequencer.component';
import { HomeComponent } from 'app/components/home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full',
  },
  {
    path: 'sequencer',
    component: SequencerComponent
  },
  {
    path: 'whim',
    pathMatch: 'full',
    loadChildren: './whim/whim.module#WhimModule'
  }
];

export const ROUTES: ModuleWithProviders = RouterModule.forRoot(routes);
