import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { SequencerComponent } from 'app/sequencer/sequencer/sequencer.component';

export const routes: Routes = [
    {
    path: '',
    component: SequencerComponent,
    pathMatch: 'full',
  }
];

export const ROUTES = RouterModule.forRoot(routes);
