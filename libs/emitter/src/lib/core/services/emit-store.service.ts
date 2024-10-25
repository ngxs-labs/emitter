import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

import { Observable } from 'rxjs';

import { flatten, getReceiverMetadata } from '../utils';
import { EmitterAction } from '../actions/actions';
import {
  Emittable,
  ReceiverMetaData,
  constructEventsForSingleDispatching,
  constructEventsForManyDispatching
} from '../internal/internals';

declare const ngDevMode: boolean;

const NG_DEV_MODE = typeof ngDevMode === 'undefined' || ngDevMode;

@Injectable()
export class EmitStore extends Store {
  emitter<T = void>(receiver: Function): Emittable<T> {
    const metadata = getReceiverMetadata(receiver);

    if (NG_DEV_MODE && metadata == null) {
      throw new Error(
        `Static metadata cannot be found, have you decorated ${receiver.name} with @Receiver()?`
      );
    }

    return {
      emit: (payload: T) => this._dispatchSingle<T>(metadata, payload),
      emitMany: (payloads: T[]) => this._dispatchMany<T>(metadata, payloads)
    };
  }

  private _dispatchSingle<T>(metadata: ReceiverMetaData, payload: T): Observable<void> {
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

  private _dispatchMany<T>(metadata: ReceiverMetaData, payloads: T[]): Observable<void> {
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
