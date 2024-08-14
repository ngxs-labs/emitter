import { InjectorAccessor } from '../services/injector-accessor.service';

/**
 * @deprecated
 * Replace with ```ts inject(EmitStore).emitter({receiver}) ```.
 * Similar to what select is doing.
 * Read the deprecation notice at this link: https://ngxs.io/deprecations/select-decorator-deprecation.
 */
export function Emitter(receiver: Function): PropertyDecorator {
  return (target: Object, key: string | symbol) => {
    Object.defineProperty(target, key, {
      get: () => {
        const store = InjectorAccessor.getEmitStore();
        return store.emitter(receiver);
      }
    });
  };
}
