import { getActionTypeFromInstance } from '@ngxs/store';

import { Observable, OperatorFunction } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { EMITTER_META_KEY, ActionStatus, ActionContext, OfEmittableActionContext } from '../internal/internals';

/**
 * `getEmittersTypes([CounterState.increment, CounterState.decrement])`
 * will return an array of strings => `['CounterState.increment', 'CounterState.decrement']`
 *
 * @param emitters - Array with references to the static functions
 * @returns - An array with types of those static functions
 */
function getEmittersTypes(emitters: Function[]): string[] {
    return emitters.reduce((accumulator: string[], emitter) => {
        if (typeof emitter !== 'function') {
            throw new TypeError(`Emitter should be a function, got ${emitter}`);
        }

        const meta = emitter[EMITTER_META_KEY];

        if (!meta || !meta.type) {
            throw new Error(`${emitter.name} should be decorated using @Emitter() decorator`);
        }

        return [...accumulator, meta.type];
    }, []);
}

/**
 * @param emitters - Array with references to the static functions decorated with `@Emitter()`
 */
export function ofEmittableDispatched(...emitters: Function[]) {
    const types = getEmittersTypes(emitters);
    return ofEmittable(types, ActionStatus.Dispatched);
}

/**
 * @param emitters - Array with references to the static functions decorated with `@Emitter()`
 */
export function ofEmittableSuccessful(...emitters: Function[]) {
    const types = getEmittersTypes(emitters);
    return ofEmittable(types, ActionStatus.Successful);
}

/**
 * @param emitters - Array with references to the static functions decorated with `@Emitter()`
 */
export function ofEmittableCanceled(...emitters: Function[]) {
    const types = getEmittersTypes(emitters);
    return ofEmittable(types, ActionStatus.Canceled);
}

/**
 * @param emitters - Array with references to the static functions decorated with `@Emitter()`
 */
export function ofEmittableErrored(...emitters: Function[]) {
    const types = getEmittersTypes(emitters);
    return ofEmittable(types, ActionStatus.Errored);
}

/**
 * @param types - Array that contains action types
 * @param status - Status of the dispatched action
 */
export function ofEmittable(types: string[], status: ActionStatus): OperatorFunction<any, OfEmittableActionContext<any>> {
    return (source: Observable<ActionContext>) => {
        return source.pipe(
            filter((ctx) => {
                return types.includes(getActionTypeFromInstance(ctx.action)) && ctx.status === status;
            }),
            map((ctx) => {
                return {
                    type: getActionTypeFromInstance(ctx.action),
                    payload: ctx.action.payload
                };
            })
        );
    };
}
