import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IdeasComponent } from './ideas/ideas.component';
import { WhimComponent } from './whim/whim.component';

const routes: Routes = [
  {
    path: 'whim',
    component: WhimComponent,
    children: [
      {
        path: 'ideas',
        component: IdeasComponent
      }
    ]
  }
];

export const whim_routing: ModuleWithProviders = RouterModule.forChild(routes);
