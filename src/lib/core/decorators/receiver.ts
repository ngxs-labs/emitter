import { ensureStoreMetadata, ReceiverMetaData, RECEIVER_META_KEY } from '../internal/internals';

/**
 * @internal
 * @returns - Generated hash w/o collisions because it's time-based
 */
function generateHash(): string {
    return (Math.random() * Date.now()).toString(36).slice(0, 8);
}

/**
 * @param options - Options passed to the `@Receiver()` decorator
 * @param target - Decorated target
 * @param key - Decorated key
 */
export function getActionProperties(options: Partial<ReceiverMetaData> | undefined, target: Function, key: string) {
    const defaultProperties = {
        type: `[ID:${generateHash()}] ${target.name}.${key}`,
        payload: undefined,
        action: undefined,
        cancelUncompleted: true,
    };

    if (!options) {
        return defaultProperties;
    }

    const { type, payload, action, cancelUncompleted } = options;

    if (type) {
        defaultProperties.type = type;
    }

    if (payload) {
        defaultProperties.payload = payload;
    }

    if (action) {
        defaultProperties.type = action.type!;
    }

    if (typeof cancelUncompleted === 'boolean') {
        defaultProperties.cancelUncompleted = cancelUncompleted;
    }

    return defaultProperties;
}

/**
 * Decorates a method with a receiver information
 *
 * @param options - Options for configuring static metadata
 * @returns - Factory for decorating method
 */
export function Receiver(options?: Partial<ReceiverMetaData>): MethodDecorator {
    return <T>(target: any, key: string | symbol, descriptor: TypedPropertyDescriptor<T>) => {
        const isNotFunctionOrNotStatic = typeof target.prototype === 'undefined' || !descriptor || typeof target[key] !== 'function';

        if (isNotFunctionOrNotStatic) {
            throw new TypeError(`Only static functions can be decorated with @Receiver() decorator`);
        }

        if (typeof key === 'symbol') {
            key = key.toString();
        }

        const meta = ensureStoreMetadata(target);
        const { type, payload, action, cancelUncompleted } = getActionProperties(options, target, key);

        if (meta.actions.hasOwnProperty(type)) {
            throw new Error(`Method decorated with such type \`${type}\` already exists`);
        }

        meta.actions[type!] = [{
            fn: `${key}`,
            options: { cancelUncompleted },
            type
        }];

        descriptor.value![RECEIVER_META_KEY] = {
            type,
            action,
            payload
        };

        target.prototype[key] = function() {
            return target[key].apply(target, arguments);
        };
    };
}
