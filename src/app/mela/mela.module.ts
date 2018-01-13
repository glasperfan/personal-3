import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MELA_ROUTES } from './mela.routes';
import { MainComponent } from './components';

@NgModule({
  imports: [
    CommonModule,
    MELA_ROUTES
  ],
  declarations: [
    MainComponent
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
