import { Injectable, Injector } from '@angular/core';

import { EmitStore } from './emit-store.service';

declare const ngDevMode: boolean;

class NgxsEmitPluginModuleIsNotImported extends Error {
  constructor() {
    super(`You've forgotten to import \`NgxsEmitPluginModule\``);
  }
}

@Injectable()
export class InjectorAccessor {
  private static injector: Injector | null = null;

  constructor(injector: Injector) {
    InjectorAccessor.injector = injector;
  }

  static getEmitStore(): never | EmitStore {
    if ((typeof ngDevMode === 'undefined' || ngDevMode) && this.injector === null) {
      throw new NgxsEmitPluginModuleIsNotImported();
    }

    return this.injector!.get<EmitStore>(EmitStore);
  }
}
