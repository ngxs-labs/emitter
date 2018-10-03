import { Injectable, Injector } from '@angular/core';

import { EmitStore } from '../../emit.service';

/**
 * Allows the `@PayloadEmitter()` decorator to get access to the DI store
 */
@Injectable()
export class PayloadEmitterFactory {
    /**
     * Injector for accessing DI
     */
    public static injector: Injector | null = null;

    /**
     * Creates PayloadEmitterFactory instance
     *
     * @param injector - Root injector
     */
    constructor(injector: Injector) {
        PayloadEmitterFactory.injector = injector;
    }
}

/**
 * Decorates a property and defines new getter
 *
 * @param emitter - Reference to the static function
 * @returns - Factory function for decorating properties
 */
export function PayloadEmitter(emitter: Function): PropertyDecorator {
    return (target: Object, key: string | symbol) => {
        Object.defineProperty(target, key, {
            get: () => {
                if (PayloadEmitterFactory.injector === null) {
                    throw new Error(`You've forgotten to import \`NgxsEmitPluginModule\``);
                }

                const store = PayloadEmitterFactory.injector!.get<EmitStore>(EmitStore);
                return store.emitter(emitter);
            }
        });
    };
}
