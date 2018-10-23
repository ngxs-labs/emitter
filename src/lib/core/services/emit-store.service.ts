import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

import { Observable } from 'rxjs';

import { RECEIVER_META_KEY, Emittable, ReceiverMetaData } from '../internal/internals';
import { EmitterAction } from '../actions/actions';

@Injectable()
export class EmitStore extends Store {
    /**
     * @param receiver - Reference to the static function from the store
     * @returns - A plain object with an `emit` function for calling emitter
     */
    public emitter<T = any, U = any>(receiver: Function): Emittable<T, U> {
        const metadata: ReceiverMetaData = receiver[RECEIVER_META_KEY];

        if (!metadata) {
            throw new Error('Emitter methods should be decorated using @Emitter() decorator');
        }

        return {
            emit: (payload?: T): Observable<U> => {
                EmitterAction.type = metadata.type;

                if (typeof payload === 'undefined' && metadata.payload !== undefined) {
                    payload = metadata.payload;
                }

                const Action: any = metadata.action ? metadata.action : EmitterAction;
                return this.dispatch(new Action(payload));
            }
        };
    }
}
