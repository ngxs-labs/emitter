import { Type } from '@angular/core';

import { Observable } from 'rxjs';

/**
 * Status of a dispatched action
 */
export const enum ActionStatus {
    Dispatched = 'DISPATCHED',
    Successful = 'SUCCESSFUL',
    Canceled = 'CANCELED',
    Errored = 'ERRORED',
}

/**
 * Static metadata for the emitter function
 *
 * @property type - Action type (optional)
 * @property action - Custom action to dispatch (optional)
 */
export interface EmitterMetaData<T extends Function = any> {
    type: string;
    action: Type<T>;
}

/**
 * Plain object that contains `emit` function that dispatches payload
 *
 * @property emit - Function that dispatches payload under the hood
 */
export interface Emittable<T = any, U = any> {
    emit(payload?: T): Observable<U>;
}

/**
 * Basic wrapper around actions
 *
 * @property status - Status of dispatched action
 * @property action - Action instance
 * @property error - Error if happened
 */
export interface ActionContext {
    status: ActionStatus;
    action: any;
    error?: Error;
}

/**
 * @property type - Action type
 * @property payload - Dispatched data
 */
export interface OfEmittableActionContext<T = any> {
    type: string;
    payload: T;
}

export const META_KEY = 'NGXS_META';

/**
 * @const - This constant is a key for defining static metadata using `@Emitter`
 */
export const EMITTER_META_KEY = 'NGXS_EMITTER_META';

export function ensureStoreMetadata(target: Function) {
    if (!target.hasOwnProperty(META_KEY)) {
        const defaultMetadata = {
            name: null,
            actions: {},
            defaults: {},
            path: null,
            children: [],
            instance: null
        };
        Object.defineProperty(target, META_KEY, { value: defaultMetadata });
    }
    return getStoreMetadata(target);
}

function getStoreMetadata(target: Function) {
    return target[META_KEY];
}
