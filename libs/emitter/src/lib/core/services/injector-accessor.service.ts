import { Injectable, Injector } from '@angular/core';

import { EmitStore } from './emit-store.service';

declare const ngDevMode: boolean;

const NG_DEV_MODE = typeof ngDevMode === 'undefined' || ngDevMode;

class NgxsEmitPluginModuleIsNotImported extends Error {
  constructor() {
    super(`You've forgotten to import \`NgxsEmitPluginModule\``);
  }
}

@Injectable()
export class InjectorAccessor {
  private static _injector: Injector | null = null;

  constructor(injector: Injector) {
    InjectorAccessor._injector = injector;
  }

  static getEmitStore(): never | EmitStore {
    if (NG_DEV_MODE && this._injector === null) {
      throw new NgxsEmitPluginModuleIsNotImported();
    }

    return this._injector!.get<EmitStore>(EmitStore);
  }
}
