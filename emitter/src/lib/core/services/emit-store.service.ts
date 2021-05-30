import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

import { Observable } from 'rxjs';

import { flatten } from '../utils';
import { EmitterAction } from '../actions/actions';
import {
  RECEIVER_META_KEY,
  Emittable,
  ReceiverMetaData,
  constructEventsForSingleDispatching,
  constructEventsForManyDispatching
} from '../internal/internals';

declare const ngDevMode: boolean;

@Injectable()
export class EmitStore extends Store {
  emitter<T = void, U = any>(receiver: Function): Emittable<T, U> {
    const metadata: ReceiverMetaData = receiver[RECEIVER_META_KEY];

    if ((typeof ngDevMode === 'undefined' || ngDevMode) && metadata == null) {
      throw new Error(
        `Static metadata cannot be found, have you decorated ${receiver.name} with @Receiver()?`
      );
    }

    return {
      emit: (payload: T) => this.dispatchSingle<T, U>(metadata, payload),
      emitMany: (payloads: T[]) => this.dispatchMany<T, U>(metadata, payloads)
    };
  }

  private dispatchSingle<T, U>(metadata: ReceiverMetaData, payload: T): Observable<U> {
    if (payload === undefined && metadata.payload !== undefined) {
      payload = metadata.payload;
    }

    const { action } = metadata;

    if (action) {
      const flattenedConstructors = flatten(action);
      return this.dispatch(constructEventsForSingleDispatching<T>(flattenedConstructors, payload));
    }

    return this.dispatch(new EmitterAction(payload, metadata.type));
  }

  private dispatchMany<T, U>(metadata: ReceiverMetaData, payloads: T[]): Observable<U> {
    if (!Array.isArray(payloads)) {
      return this.dispatch([]);
    }

    const { action } = metadata;

    if (action) {
      const flattenedConstructors = flatten(action);
      return this.dispatch(constructEventsForManyDispatching(flattenedConstructors, payloads));
    }

    return this.dispatch(payloads.map(payload => new EmitterAction(payload, metadata.type)));
  }
}
