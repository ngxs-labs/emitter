import { Injectable, Injector } from '@angular/core';

import { is } from '../utils';
import { EmitStore } from './emit-store.service';

class NgxsEmitPluginModuleIsNotImported extends Error {
  constructor() {
    super(`You've forgotten to import \`NgxsEmitPluginModule\``);
  }
}

/**
 * Allows multiple decorators to get access to the DI store
 */
@Injectable()
export class InjectorAccessor {
  /**
   * Injector for accessing DI
   */
  private static injector: Injector | null = null;

  /**
   * Creates InjectorAccessor instance
   *
   * @param injector - Root injector
   */
  constructor(injector: Injector) {
    InjectorAccessor.injector = injector;
  }

  public static getEmitStore(): never | EmitStore {
    if (is.null(this.injector)) {
      throw new NgxsEmitPluginModuleIsNotImported();
    }

    return this.injector.get<EmitStore>(EmitStore);
  }
}
