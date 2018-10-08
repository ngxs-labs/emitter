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
    return emitters.reduce((accumulator: string[], ctor) => [...accumulator, ctor[EMITTER_META_KEY].type], []);
}

export function ofEmittableDispatched(...emitters: Function[]): (o: Observable<any>) => Observable<any> {
    const types = getEmittersTypes(emitters);
    return ofEmittable(types, ActionStatus.Dispatched);
}

export function ofEmittableSuccessful(...emitters: Function[]): (o: Observable<any>) => Observable<any> {
    const types = getEmittersTypes(emitters);
    return ofEmittable(types, ActionStatus.Successful);
}

export function ofEmittableCanceled(...emitters: Function[]): (o: Observable<any>) => Observable<any> {
    const types = getEmittersTypes(emitters);
    return ofEmittable(types, ActionStatus.Canceled);
}

export function ofEmittableErrored(...emitters: Function[]): (o: Observable<any>) => Observable<any> {
    const types = getEmittersTypes(emitters);
    return ofEmittable(types, ActionStatus.Errored);
}

export function ofEmittable<T = any>(types: string[], status: ActionStatus): OperatorFunction<any, OfEmittableActionContext<T>> {
    return (source: Observable<ActionContext>) => {
        return source.pipe(
            filter((ctx) => {
                return types.indexOf(getActionTypeFromInstance(ctx.action)) !== -1 && ctx.status === status;
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
