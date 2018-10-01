import { Observable } from 'rxjs';

export interface EmitterMetaData {
    type: string;
}

export interface DispatchEmitter<T = any, U = any> {
    emit(payload?: T): Observable<U>;
}

export const META_KEY = 'NGXS_META';
export const EMITTER_META_KEY = 'NGXS_SELECTOR_META';

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
