import { Observable } from 'rxjs';

declare module '@ngxs/store' {
    export class Store {
        public emitter<T = any, U = any>(emitter: Function): {
            emit(payload?: T): Observable<U>;
        };
    }
}
