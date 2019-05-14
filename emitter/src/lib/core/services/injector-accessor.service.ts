import { Injectable, Injector } from '@angular/core';

import { is } from '../utils';

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

  /**
   * @returns - Error if `NgxsEmitPluginModule` is not imported or injector instance
   */
  public static getInjector(): never | Injector {
    if (is.null(this.injector)) {
      throw new Error(`You've forgotten to import \`NgxsEmitPluginModule\``);
    }

    return this.injector;
  }
}
