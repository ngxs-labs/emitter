import { getActionTypeFromInstance } from '@ngxs/store';

import { OperatorFunction } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import {
  ActionStatus,
  ActionContext,
  OfEmittableActionContext,
  Types
} from '../internal/internals';
import { getReceiverMetadata } from '../utils';

declare const ngDevMode: boolean;

const NG_DEV_MODE = typeof ngDevMode === 'undefined' || ngDevMode;

/**
 * `getReceiverTypes([CounterState.increment, CounterState.decrement])`
 * will return a hashmap => `{ 'CounterState.increment': true, 'CounterState.decrement': true }`
 */
function getReceiverTypes(receivers: Function[]): Types {
  const types: Types = {};

  for (const receiver of receivers) {
    if (NG_DEV_MODE && typeof receiver !== 'function') {
      throw new TypeError(`Receiver should be a function, got ${receiver}`);
    }

    const metadata = getReceiverMetadata(receiver);

    if (NG_DEV_MODE && (metadata == null || metadata.type == null)) {
      throw new Error(`${receiver.name} should be decorated with @Receiver() decorator`);
    }

    types[metadata.type] = true;
  }

  return types;
}

export function ofEmittableDispatched(
  ...receivers: Function[]
): OperatorFunction<any, OfEmittableActionContext<any>> {
  return ofEmittable(getReceiverTypes(receivers), ActionStatus.Dispatched);
}

export function ofEmittableSuccessful(
  ...receivers: Function[]
): OperatorFunction<any, OfEmittableActionContext<any>> {
  return ofEmittable(getReceiverTypes(receivers), ActionStatus.Successful);
}

export function ofEmittableCanceled(
  ...receivers: Function[]
): OperatorFunction<any, OfEmittableActionContext<any>> {
  return ofEmittable(getReceiverTypes(receivers), ActionStatus.Canceled);
}

export function ofEmittableErrored(
  ...receivers: Function[]
): OperatorFunction<any, OfEmittableActionContext<any>> {
  return ofEmittable(getReceiverTypes(receivers), ActionStatus.Errored);
}

export function ofEmittable(
  types: Types,
  status: ActionStatus
): OperatorFunction<any, OfEmittableActionContext<any>> {
  return source =>
    source.pipe(
      filter((ctx: ActionContext) => {
        const type = getActionTypeFromInstance(ctx.action)!;
        const hashMapHasType = !!types[type];
        const contextHasTransmittedStatus = ctx.status === status;
        return hashMapHasType && contextHasTransmittedStatus;
      }),
      map(
        ({ action, error }: ActionContext) =>
          <OfEmittableActionContext>{
            error,
            type: getActionTypeFromInstance(action),
            payload: action.payload
          }
      )
    );
}
