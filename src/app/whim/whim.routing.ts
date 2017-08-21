import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WhimComponent } from './whim/whim.component';

const routes: Routes = [
  {
    path: 'whim',
    component: WhimComponent
  }
];

export const whim_routing: ModuleWithProviders = RouterModule.forChild(routes);
