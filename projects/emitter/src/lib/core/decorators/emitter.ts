import { ensureStoreMetadata, EmitterMetaData, EMITTER_META_KEY } from '../internal/internals';

/**
 * Decorates a method with an emitter information.
 */
export function Emitter(options?: Partial<EmitterMetaData>): MethodDecorator {
    return <T>(target: any, key: string | symbol, descriptor: TypedPropertyDescriptor<T>) => {
        if (typeof descriptor.value !== 'function' || typeof target[key] !== 'function') {
            throw new TypeError(`Only static functions can be decorated with @Emitter() decorator`);
        }

        const meta = ensureStoreMetadata(target);

        if (typeof key === 'symbol') {
            key = key.toString();
        }

        const type: string = (options && options.type) || `${target.name}.${key}`;

        if (meta.actions[type]) {
            throw new Error(`Method decorated with such type \`${type}\` already exists`);
        }

        meta.actions[type] = [
            {
                fn: `${key}`,
                options: {},
                type
            }
        ];

        descriptor.value[EMITTER_META_KEY] = { type };
        target.prototype[key] = function() {
            return target[key].apply(target, arguments);
        };
    };
}
