import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
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
  }
];

export const ROUTES = RouterModule.forRoot(routes);
