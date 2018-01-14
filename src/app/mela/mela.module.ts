import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MELA_ROUTES } from './mela.routes';
import { MainComponent, DashboardComponent, DisplayComponent } from './components';

@NgModule({
  imports: [
    CommonModule,
    MELA_ROUTES
  ],
  declarations: [
    MainComponent,
    DashboardComponent,
    DisplayComponent
  ]
})
export class MelaModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MelaModule,
      providers: []
    };
  }
}
