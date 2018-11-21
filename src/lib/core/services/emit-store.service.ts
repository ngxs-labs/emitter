import { Injectable, Type } from '@angular/core';
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
            throw new Error(`I can't seem to find static metadata. Have you decorated ${receiver.name} with @Receiver()?`);
        }

        return {
            emit: (payload?: T) => this.dispatchSingle<T, U>(metadata, payload),
            emitMany: (payloads?: T[]) => this.dispatchMany<T, U>(metadata, payloads)
        };
    }

    /**
     * @param metadata - Receiver function metadata
     * @param payload - Data to dispatch
     * @returns - An observable that emits events after dispatch
     */
    private dispatchSingle<T, U>(metadata: ReceiverMetaData, payload?: T): Observable<U> {
        EmitterAction.type = metadata.type;

        const shouldApplyDefaultPayload = typeof payload === 'undefined' && metadata.payload !== undefined;
        if (shouldApplyDefaultPayload) {
            payload = metadata.payload;
        }

        let { action } = metadata;

        if (!action) {
            return this.dispatch(new EmitterAction(payload));
        }

        if (!Array.isArray(action)) {
            action = [action];
        }

        return this.dispatch(this.constructEventsForSingleDispatching<T>(action, payload));
    }

    /**
     * @param metadata - Receiver function metadata
     * @param payloads - Array with data to dispatch
     * @returns - An observable that emits events after dispatch
     */
    private dispatchMany<T, U>(metadata: ReceiverMetaData, payloads?: T[]): Observable<U> {
        if (!Array.isArray(payloads)) {
            return this.dispatch([]);
        }

        EmitterAction.type = metadata.type;

        let { action } = metadata;

        if (!action) {
            return this.dispatch(
                payloads.map((payload) => new EmitterAction(payload))
            );
        }

        if (!Array.isArray(action)) {
            action = [action];
        }

        return this.dispatch(this.constructEventsForManyDispatching(action, payloads));
    }

    /**
     * @param constructors - Array of classes (actions)
     * @param payload - Payload to dispatch
     * @returns - Actions instances
     */
    private constructEventsForSingleDispatching<T>(constructors: Type<any>[], payload: T | undefined): any {
        return constructors.map((Cls) => new Cls(payload));
    }

    /**
     * @param constructors - Array of classes (actions)
     * @param payloads - Payloads to dispatch
     * @returns - Actions instances
     */
    private constructEventsForManyDispatching<T>(constructors: Type<any>[], payloads: T[]): any {
        const events = [];

        for (const Cls of constructors) {
            for (const payload of payloads) {
                events.push(new Cls(payload));
            }
        }

        return events;
    }
}
