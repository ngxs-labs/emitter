import { Injectable, Injector } from '@angular/core';
import { Store } from '@ngxs/store';

/**
 * Allows the `@EmitPayload()` decorator to get access to the DI store.
 * @ignore
 */
@Injectable()
export class EmitPayloadFactory {
    public static injector: Injector | null = null;

    constructor(injector: Injector) {
        EmitPayloadFactory.injector = injector;
    }
}

/**
 * Decorates a property and defines new getter.
 */
export function EmitPayload(emitter: Function): PropertyDecorator {
    return (target: Object, key: string | symbol) => {
        Object.defineProperty(target, key, {
            get: () => {
                const store = EmitPayloadFactory.injector !.get<Store>(Store);
                return store.emitter(emitter);
            }
        });
    };
}
