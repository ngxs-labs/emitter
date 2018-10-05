import { InjectorAccessor } from '../services/injector-accessor.service';
import { EmitStore } from '../services/emit-store.service';

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
                const store = InjectorAccessor.getInjector().get<EmitStore>(EmitStore);
                return store.emitter(emitter);
            }
        });
    };
}
