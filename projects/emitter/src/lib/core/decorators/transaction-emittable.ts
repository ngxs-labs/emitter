import { EmitStore } from '../services/emit-store.service';
import { InjectorAccessor } from '../services/injector-accessor.service';

/**
 * Decorates a property and defines new getter
 *
 * @param emitters - Array that contains references to static functions
 * @returns - Factory function for decorating properties
 */
export function TransactionEmittable(emitters: Function[]): PropertyDecorator {
    return (target: any, key: string | symbol) => {
        Object.defineProperty(target, key, {
            get: () => {
                const store = InjectorAccessor.getInjector().get<EmitStore>(EmitStore);
                return store.transactionEmitter(emitters);
            }
        });
    };
}
