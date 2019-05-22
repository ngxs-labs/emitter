import { ensureStoreMetadata, StateContext } from '@ngxs/store';

import { is, isNotAFunction } from '../utils';
import { RECEIVER_META_KEY, ReceiverMetaData, ActionHandler } from '../internal/internals';

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
 * @param target - Decorated target
 * @param key - Decorated key
 */
function getActionProperties(options: Partial<ReceiverMetaData> | undefined, target: Function, key: string) {
  const defaultProperties: ReceiverMetaData = {
    type: `[ID:${generateHash()}] ${target.name}.${key}`,
    payload: undefined,
    action: undefined!,
    cancelUncompleted: true
  };

  if (is.nullOrUndefined(options)) {
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
    defaultProperties.action = action;

    if (!is.array(action)) {
      defaultProperties.type = action.type;
    }
  }

  if (is.boolean(cancelUncompleted)) {
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
  return (target: any, key: string | symbol, descriptor: TypedPropertyDescriptor<ActionHandler>) => {
    const isNotFunctionOrNotStatic =
      is.undefined(target.prototype) || is.falsy(descriptor) || isNotAFunction(target[key]);

    if (isNotFunctionOrNotStatic) {
      throw new TypeError(`Only static functions can be decorated with @Receiver() decorator`);
    }

    const reservedKeyAlreadyExists = key in target.prototype;
    if (reservedKeyAlreadyExists) {
      throw new Error(`Property with name \`${key.toString()}\` already exists, please rename to avoid conflicts`);
    }

    if (typeof key !== 'string') {
      key = String(key);
    }

    const meta = ensureStoreMetadata(target);
    const { type, payload, action, cancelUncompleted } = getActionProperties(options, target, key);

    if (meta.actions.hasOwnProperty(type)) {
      throw new Error(`Method decorated with such type \`${type}\` already exists`);
    }

    if (is.array(action)) {
      for (const { type } of action) {
        meta.actions[type] = [
          {
            fn: `${key}`,
            options: { cancelUncompleted },
            type
          }
        ];
      }
    } else {
      meta.actions[type] = [
        {
          fn: `${key}`,
          options: { cancelUncompleted },
          type
        }
      ];
    }

    descriptor.value![RECEIVER_META_KEY] = {
      type,
      action,
      payload
    };

    target.prototype[key] = function(ctx: StateContext<any>, action: any) {
      return target[key].call(target, ctx, action);
    };
  };
}
