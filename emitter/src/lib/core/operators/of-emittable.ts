import { getActionTypeFromInstance } from '@ngxs/store';

import { OperatorFunction } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import {
  RECEIVER_META_KEY,
  ActionStatus,
  ActionContext,
  OfEmittableActionContext,
  ReceiverMetaData,
  Types
} from '../internal/internals';

declare const ngDevMode: boolean;

/**
 * `getReceiverTypes([CounterState.increment, CounterState.decrement])`
 * will return a hashmap => `{ 'CounterState.increment': true, 'CounterState.decrement': true }`
 */
function getReceiverTypes(receivers: Function[]): Types {
  const types: Types = {};

  for (const receiver of receivers) {
    if ((typeof ngDevMode === 'undefined' || ngDevMode) && typeof receiver !== 'function') {
      throw new TypeError(`Receiver should be a function, got ${receiver}`);
    }

    const meta: ReceiverMetaData = receiver[RECEIVER_META_KEY];

    if ((typeof ngDevMode === 'undefined' || ngDevMode) && (meta == null || meta.type == null)) {
      throw new Error(`${receiver.name} should be decorated with @Receiver() decorator`);
    }

    types[meta.type] = true;
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
