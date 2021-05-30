import { ensureStoreMetadata, StateContext } from '@ngxs/store';

import { RECEIVER_META_KEY, ReceiverMetaData, ActionHandler } from '../internal/internals';

declare const ngDevMode: boolean;

function generateHash(): string {
  return (Math.random() * Date.now()).toString(36).slice(0, 8);
}

function getActionProperties(
  options: Partial<ReceiverMetaData> | undefined,
  target: Function,
  key: string
) {
  const defaultProperties: ReceiverMetaData = {
    type: `[ID:${generateHash()}] ${target.name}.${key}`,
    payload: undefined,
    action: undefined!,
    cancelUncompleted: true
  };

  if (options == null) {
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

    if (!Array.isArray(action)) {
      defaultProperties.type = action.type;
    }
  }

  if (typeof cancelUncompleted === 'boolean') {
    defaultProperties.cancelUncompleted = cancelUncompleted;
  }

  return defaultProperties;
}

export function Receiver(options?: Partial<ReceiverMetaData>): MethodDecorator {
  return (
    target: any,
    key: string | symbol,
    descriptor: TypedPropertyDescriptor<ActionHandler>
  ) => {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      const isNotFunctionOrNotStatic =
        target.prototype == null || descriptor == null || typeof target[key] !== 'function';

      if (isNotFunctionOrNotStatic) {
        throw new TypeError(`Only static functions can be decorated with @Receiver() decorator`);
      }

      const reservedKeyAlreadyExists = key in target.prototype;
      if (reservedKeyAlreadyExists) {
        throw new Error(
          `Property with name \`${key.toString()}\` already exists, please rename to avoid conflicts`
        );
      }
    }

    if (typeof key !== 'string') {
      key = String(key);
    }

    const meta = ensureStoreMetadata(target);
    const { type, payload, action, cancelUncompleted } = getActionProperties(options, target, key);

    if ((typeof ngDevMode === 'undefined' || ngDevMode) && meta.actions.hasOwnProperty(type)) {
      throw new Error(`Method decorated with such type \`${type}\` already exists`);
    }

    if (Array.isArray(action)) {
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
