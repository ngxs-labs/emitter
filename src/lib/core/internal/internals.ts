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
 * Action class contract
 */
export type Action<T> = Type<T> & {
    type?: string;
};

/**
 * Static metadata for the receiver function
 *
 * @property type - Action type (optional)
 * @property action - Custom action to dispatch (optional)
 */
export interface ReceiverMetaData<T extends Function = any> {
    type: string;
    payload: any;
    action: Action<T>;
    cancelUncompleted: boolean;
}

/**
 * Plain object that contains helpers that dispatch payload
 *
 * @property emit - Function that dispatches payload under the hood
 * @property emitMany - Function that makes multiple dispatching under the hood
 */
export interface Emittable<T = any, U = any> {
    emit(payload?: T): Observable<U>;
    emitMany(payloads?: T[]): Observable<U>;
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

/**
 * @const - This constant is a key for defining static metadata using `@Receiver`
 */
export const RECEIVER_META_KEY = 'NGXS_RECEIVER_META';
