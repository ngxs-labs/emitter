import { NgModule, ModuleWithProviders, Self, makeEnvironmentProviders } from '@angular/core';

import { EmitStore } from './core/services/emit-store.service';
import { EmitterService } from './core/services/emitter.service';
import { InjectorAccessor } from './core/services/injector-accessor.service';

export function withNgxsEmitPlugin() {
  return makeEnvironmentProviders([EmitStore, EmitterService, InjectorAccessor]);
}

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
