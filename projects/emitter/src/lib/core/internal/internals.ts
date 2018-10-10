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
 * Static metadata for the receiver function
 *
 * @property type - Action type (optional)
 * @property action - Custom action to dispatch (optional)
 */
export interface ReceiverMetaData<T extends Function = any> {
    type: string;
    action: Type<T> & {
        type?: string;
    };
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
 * Action context that maps `ofEmittable` operator
 *
 * @property type - Action type
 * @property payload - Dispatched data
 * @property error - Error that has been throwed or undefined
 */
export interface OfEmittableActionContext<T = any> {
    type: string;
    payload: T;
    error: Error | undefined;
}

/**
 * Hashmap that contains types to filter using `ofEmittable` operator
 *
 * @property key - Any string key
 */
export interface Types {
    [key: string]: boolean;
}

export const META_KEY = 'NGXS_META';

/**
 * @const - This constant is a key for defining static metadata using `@Receiver`
 */
export const RECEIVER_META_KEY = 'NGXS_RECEIVER_META';

/**
 * This is an internal `@ngxs/store` function and not accessable from outside, even using theta symbol
 *
 * @param target - Target to apply static metadata to
 * @returns - Static metadata
 */
export function ensureStoreMetadata(target: Function): any {
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

/**
 * @param target - Target to get static metadata from
 * @returns - Static metadata
 */
function getStoreMetadata(target: Function): any | undefined {
    return target[META_KEY];
}
