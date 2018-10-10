import { getActionTypeFromInstance } from '@ngxs/store';

import { Observable, OperatorFunction } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { RECEIVER_META_KEY, ActionStatus, ActionContext, OfEmittableActionContext, ReceiverMetaData, Types } from '../internal/internals';

/**
 * `getReceiverTypes([CounterState.increment, CounterState.decrement])`
 * will return a hashmap => `{ 'CounterState.increment': true, 'CounterState.decrement': true }`
 *
 * @param receivers - Array with references to the static functions
 * @returns - A key-value map where a key is a type
 */
function getReceiverTypes(emitters: Function[]): Types {
    const types: Types = {};

    let i = emitters.length;
    while (i--) {
        const emitter = emitters[i];
        const isNotFunction = typeof emitter !== 'function';

        if (isNotFunction) {
            throw new TypeError(`Emitter should be a function, got ${emitter}`);
        }

        const meta: ReceiverMetaData = emitter[RECEIVER_META_KEY];
        const isNotAnnotated = !meta || !meta.type;

        if (isNotAnnotated) {
            throw new Error(`${emitter.name} should be decorated using @Receiver() decorator`);
        }

        types[meta.type] = true;
    }

    return types;
}

/**
 * @param receivers - Array with references to the static functions decorated with `@Receiver()`
 */
export function ofEmittableDispatched(...receivers: Function[]): OperatorFunction<any, OfEmittableActionContext<any>> {
    return ofEmittable(getReceiverTypes(receivers), ActionStatus.Dispatched);
}

/**
 * @param receivers - Array with references to the static functions decorated with `@Receiver()`
 */
export function ofEmittableSuccessful(...receivers: Function[]): OperatorFunction<any, OfEmittableActionContext<any>> {
    return ofEmittable(getReceiverTypes(receivers), ActionStatus.Successful);
}

/**
 * @param receivers - Array with references to the static functions decorated with `@Receiver()`
 */
export function ofEmittableCanceled(...receivers: Function[]): OperatorFunction<any, OfEmittableActionContext<any>> {
    return ofEmittable(getReceiverTypes(receivers), ActionStatus.Canceled);
}

/**
 * @param receivers - Array with references to the static functions decorated with `@Receiver()`
 */
export function ofEmittableErrored(...receivers: Function[]): OperatorFunction<any, OfEmittableActionContext<any>> {
    return ofEmittable(getReceiverTypes(receivers), ActionStatus.Errored);
}

/**
 * @param types - Hashmap that contains action types
 * @param status - Status of the dispatched action
 * @returns - RxJS factory operator function
 */
export function ofEmittable(types: Types, status: ActionStatus): OperatorFunction<any, OfEmittableActionContext<any>> {
    return (source: Observable<ActionContext>) => {
        return source.pipe(
            filter((ctx: ActionContext) => {
                const hashMapHasType = types[getActionTypeFromInstance(ctx.action)];
                const contextHasTransmittedStatus = ctx.status === status;
                return hashMapHasType && contextHasTransmittedStatus;
            }),
            map(({ action, error }: ActionContext) => ({
                type: getActionTypeFromInstance(action),
                payload: action.payload,
                error
            }))
        );
    };
}
