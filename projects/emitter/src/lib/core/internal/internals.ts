import { Observable } from 'rxjs';

/**
 * Custom action interface
 *
 * @property type - Static property that defines action type
 */
export interface CustomAction<T = any, U = any> {
    type: string;
    new (payload?: U): T;
}

/**
 * Static metadata for the emitter function
 *
 * @property type - Action type (optional)
 * @property action - Custom action to dispatch (optional)
 */
export interface EmitterMetaData<T extends Function = any> {
    type: string;
    action: CustomAction<T>;
}

/**
 * Plain object that contains `emit` function that dispatches payload
 *
 * @property emit - Function that dispatches payload under the hood
 */
export interface Emittable<T = any, U = any> {
    emit(payload?: T): Observable<U>;
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
