import { NgModule, Type, ModuleWithProviders } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { NgxsEmitPluginModule } from '@ngxs-labs/emitter';

@NgModule()
export class StoreTestBedModule {
  static configureTestingModule(
    states: Type<any>[] = []
  ): [ModuleWithProviders<NgxsModule>, ModuleWithProviders<NgxsEmitPluginModule>] {
    return [NgxsModule.forRoot(states), NgxsEmitPluginModule.forRoot()];
  }
}
