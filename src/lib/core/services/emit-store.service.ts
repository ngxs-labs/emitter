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
        const receiverEvent: ReceiverMetaData = receiver[RECEIVER_META_KEY];

        if (!receiverEvent) {
            throw new Error(`I can't seem to find static metadata. Have you decorated ${receiver.name} with @Receiver()?`);
        }

        return {
            emit: (payload?: T): Observable<U> => {
                EmitterAction.type = receiverEvent.type;
                const Action: any | typeof EmitterAction = receiverEvent.action ? receiverEvent.action : EmitterAction;
                return this.dispatch(new Action(payload));
            }
        };
    }
}
