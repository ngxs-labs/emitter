import { ensureStoreMetadata, ReceiverMetaData, RECEIVER_META_KEY } from '../internal/internals';

/**
 * @internal
 * @returns - Generated hash w/o collisions because it's time-based
 */
function generateHash(): string {
    return (Math.random() * Date.now()).toString(36).slice(0, 8);
}

/**
 * @internal
 * @param options - Options passed to the `@Receiver()` decorator
 * @param target - Decorated class
 * @param key - Decorated property name
 * @returns - Action type
 */
function getActionType(options: Partial<ReceiverMetaData>, target: Function, key: string): string {
    const action = options && options.action;

    if (action) {
        if (typeof action.type !== 'string') {
            throw new Error(`${action.name}'s type should be defined as a static property \`type\``);
        }

        return action.type;
    }

    return (options && options.type) || `[ID:${generateHash()}] ${target.name}.${key}`;
}

/**
 * @internal
 * @param options - Options passed to the `@Receiver()` decorator
 */
function getActionProperties(options: Partial<ReceiverMetaData> | undefined): Partial<ReceiverMetaData> {
    if (!options) {
        return {
            action: undefined,
            payload: undefined,
            cancelUncompleted: true
        };
    }

    let cancelUncompleted = true;
    if (typeof options.cancelUncompleted === 'boolean') {
        cancelUncompleted = options.cancelUncompleted;
    }

    return { action: options.action, payload: options.payload, cancelUncompleted };
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
        const type = getActionType(options as Partial<ReceiverMetaData>, target, key);

        if (meta.actions.hasOwnProperty(type)) {
            throw new Error(`Method decorated with such type \`${type}\` already exists`);
        }

        const { action, payload, cancelUncompleted } = getActionProperties(options);

        meta.actions[type] = [{
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
