import { NgModule, ModuleWithProviders, Self } from '@angular/core';

import { EmitStore } from './core/services/emit-store.service';
import { EmitterService } from './core/services/emitter.service';
import { InjectorAccessor } from './core/services/injector-accessor.service';

@NgModule()
export class NgxsEmitPluginModule {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(@Self() _injectorAccessor: InjectorAccessor) {}

  static forRoot(): ModuleWithProviders<NgxsEmitPluginModule> {
    return {
      ngModule: NgxsEmitPluginModule,
      providers: [EmitStore, EmitterService, InjectorAccessor]
    };
  }
}
