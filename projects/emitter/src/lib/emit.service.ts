import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

import { Observable } from 'rxjs';

import { EMITTER_META_KEY, DispatchEmitter } from './core/internal/internals';
import { EmitterAction } from './core/actions/actions';

@Injectable()
export class EmitStore extends Store {
    /**
     * @param emitter - Reference to the static function from the store
     * @returns a plain object with an `emit` function for calling emitter
     */
    public emitter<T = any, U = any>(emitter: Function): DispatchEmitter<T, U> {
        const emitterEvent = emitter[EMITTER_META_KEY];

        if (!emitterEvent) {
            throw new Error('Emitter methods should be decorated using @Emitter() decorator');
        }

        return {
            emit: (payload?: T): Observable<U> => {
                EmitterAction.type = emitterEvent.type;
                return this.dispatch(new EmitterAction<T>(payload));
            }
        };
    }
}
