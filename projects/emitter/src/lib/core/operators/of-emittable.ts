import { getActionTypeFromInstance } from '@ngxs/store';

import { Observable, OperatorFunction } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { EMITTER_META_KEY, ActionStatus, ActionContext, OfEmittableActionContext, EmitterMetaData, Types } from '../internal/internals';

/**
 * `getEmittersTypes([CounterState.increment, CounterState.decrement])`
 * will return a hashmap => `{ 'CounterState.increment': true, 'CounterState.decrement': true }`
 *
 * @param emitters - Array with references to the static functions
 * @returns - A key-value map where a key is a type
 */
function getEmittersTypes(emitters: Function[]): Types {
    const types: Types = {};

    let i = emitters.length;
    while (i--) {
        const emitter = emitters[i];

        if (typeof emitter !== 'function') {
            throw new TypeError(`Emitter should be a function, got ${emitter}`);
        }

        const meta: EmitterMetaData = emitter[EMITTER_META_KEY];

        if (!meta || !meta.type) {
            throw new Error(`${emitter.name} should be decorated using @Emitter() decorator`);
        }

        types[meta.type] = true;
    }

    return types;
}

/**
 * @param emitters - Array with references to the static functions decorated with `@Emitter()`
 */
export function ofEmittableDispatched(...emitters: Function[]) {
    return ofEmittable(getEmittersTypes(emitters), ActionStatus.Dispatched);
}

/**
 * @param emitters - Array with references to the static functions decorated with `@Emitter()`
 */
export function ofEmittableSuccessful(...emitters: Function[]) {
    return ofEmittable(getEmittersTypes(emitters), ActionStatus.Successful);
}

/**
 * @param emitters - Array with references to the static functions decorated with `@Emitter()`
 */
export function ofEmittableCanceled(...emitters: Function[]) {
    return ofEmittable(getEmittersTypes(emitters), ActionStatus.Canceled);
}

/**
 * @param emitters - Array with references to the static functions decorated with `@Emitter()`
 */
export function ofEmittableErrored(...emitters: Function[]) {
    return ofEmittable(getEmittersTypes(emitters), ActionStatus.Errored);
}

/**
 * @param types - Hash map that contains action types
 * @param status - Status of the dispatched action
 */
export function ofEmittable(types: Types, status: ActionStatus): OperatorFunction<any, OfEmittableActionContext<any>> {
    return (source: Observable<ActionContext>) => {
        return source.pipe(
            filter((ctx: ActionContext) => {
                const hashMapHasType = types[getActionTypeFromInstance(ctx.action)];
                const contextHasTransmittedStatus = ctx.status === status;
                return hashMapHasType && contextHasTransmittedStatus;
            }),
            map((ctx: ActionContext) => ({
                type: getActionTypeFromInstance(ctx.action),
                payload: ctx.action.payload
            }))
        );
    };
}
