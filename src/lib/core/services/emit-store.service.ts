import { Injectable, Type } from '@angular/core';
import { Store } from '@ngxs/store';

import { Observable } from 'rxjs';

import { RECEIVER_META_KEY, Emittable, ReceiverMetaData, Action } from '../internal/internals';
import { EmitterAction } from '../actions/actions';

/**
 * @internal
 * @param constructorOrConstructors - Single class or array of classes
 * @returns - Array of classes (actions)
 */
function flattenConstructors(constructorOrConstructors: Action<any> | Action<any>[]): Action<any>[] {
    if (Array.isArray(constructorOrConstructors)) {
        return constructorOrConstructors;
    }

    return [constructorOrConstructors];
}

/**
 * @internal
 * @param constructors - Array of classes (actions)
 * @param payload - Payload to dispatch
 * @returns - Array of instances
 */
function constructEventsForSingleDispatching<T>(constructors: Type<any>[], payload: T | undefined): any {
    return constructors.map((Cls) => new Cls(payload));
}

/**
 * @internal
 * @param constructors - Array of classes (actions)
 * @param payloads - Payloads to dispatch
 * @returns - Array of instances
 */
function constructEventsForManyDispatching<T>(constructors: Type<any>[], payloads: T[]): any {
    const events = [];

    for (let i = 0; i < constructors.length; i++) {
        const Cls = constructors[i];
        for (let j = 0; j < payloads.length; j++) {
            events.push(new Cls(payloads[j]));
        }
    }

    return events;
}

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

        const { action: constructors } = metadata;

        if (constructors) {
            return this.dispatch(constructEventsForSingleDispatching<T>(flattenConstructors(constructors), payload));
        }

        return this.dispatch(new EmitterAction(payload));
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

        const { action: constructors } = metadata;

        if (constructors) {
            return this.dispatch(constructEventsForManyDispatching(flattenConstructors(constructors), payloads));
        }

        return this.dispatch(
            payloads.map((payload) => new EmitterAction(payload))
        );
    }
}
