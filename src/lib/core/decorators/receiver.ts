import { ensureStoreMetadata, ReceiverMetaData, RECEIVER_META_KEY } from '../internal/internals';

/**
 * @internal
 * @returns - Generated hash w/o collisions because it's time-based
 */
function generateHash(): string {
    return (Math.random() * Date.now()).toString(36).slice(0, 8);
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
        const action = options && options.action;
        const typeIsNotString = action && typeof action.type !== 'string';

        if (typeIsNotString) {
            throw new Error('Action type should be defined as a static property `type`');
        }

        const payload = options && options.payload;
        const actionId = generateHash();

        let type: string = null!;
        if (action) {
            type = action.type!;
        } else {
            const defaultType = `[ID:${actionId}] ${target.name}.${key}`;
            const customType = options && options.type;
            type = customType || defaultType;
        }

        if (meta.actions[type]) {
            throw new Error(`Method decorated with such type \`${type}\` already exists`);
        }

        meta.actions[type] = [{
            fn: `${key}`,
            options: {
                cancelUncompleted: Boolean(options && options.cancelUncompleted)
            },
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
