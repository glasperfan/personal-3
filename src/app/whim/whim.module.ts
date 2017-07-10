import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdeasComponent } from './ideas/ideas.component';
import { FriendService } from './services/friend.service';
import { IdeaGeneratorService } from './services/idea-generator.service';
import { whim_routing } from './whim.routing';
import { WhimComponent } from './whim/whim.component';

@NgModule({
  imports: [
    CommonModule,
    whim_routing
  ],
  declarations: [ WhimComponent, IdeasComponent ],
  exports: [ ] /* components referenced in RootModule */
})
export class WhimModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: WhimModule,
      providers: [
        FriendService,
        IdeaGeneratorService
      ]
    };
  }
}
