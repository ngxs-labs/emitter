import { Injectable, Injector } from '@angular/core';

import { EmitStore } from '../../emit.service';

/**
 * Allows the `@PayloadEmitter()` decorator to get access to the DI store.
 * @ignore
 */
@Injectable()
export class PayloadEmitterFactory {
    public static injector: Injector | null = null;

    constructor(injector: Injector) {
        PayloadEmitterFactory.injector = injector;
    }
}

/**
 * Decorates a property and defines new getter.
 */
export function PayloadEmitter(emitter: Function): PropertyDecorator {
    return (target: Object, key: string | symbol) => {
        Object.defineProperty(target, key, {
            get: () => {
                const store = PayloadEmitterFactory.injector !.get<EmitStore>(EmitStore);
                return store.emitter(emitter);
            }
        });
    };
}
