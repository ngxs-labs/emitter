import { InjectorAccessor } from '../services/injector-accessor.service';

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
