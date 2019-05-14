import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

import { Observable } from 'rxjs';

import { is, flatten } from '../utils';
import { EmitterAction } from '../actions/actions';
import {
  RECEIVER_META_KEY,
  Emittable,
  ReceiverMetaData,
  constructEventsForSingleDispatching,
  constructEventsForManyDispatching
} from '../internal/internals';

@Injectable()
export class EmitStore extends Store {
  /**
   * @param receiver - Reference to the static function from the store
   * @returns - A plain object with an `emit` function for calling emitter
   */
  public emitter<T = any, U = any>(receiver: Function): Emittable<T, U> {
    const metadata: ReceiverMetaData = receiver[RECEIVER_META_KEY];

    if (is.falsy(metadata)) {
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

    if (is.undefined(payload) && metadata.payload !== undefined) {
      payload = metadata.payload;
    }

    const { action } = metadata;

    if (action) {
      const flattenedConstructors = flatten(action);
      return this.dispatch(constructEventsForSingleDispatching<T>(flattenedConstructors, payload));
    }

    return this.dispatch(new EmitterAction(payload));
  }

  /**
   * @param metadata - Receiver function metadata
   * @param payloads - Array with data to dispatch
   * @returns - An observable that emits events after dispatch
   */
  private dispatchMany<T, U>(metadata: ReceiverMetaData, payloads?: T[]): Observable<U> {
    if (!is.array(payloads)) {
      return this.dispatch([]);
    }

    EmitterAction.type = metadata.type;

    const { action } = metadata;

    if (action) {
      const flattenedConstructors = flatten(action);
      return this.dispatch(constructEventsForManyDispatching(flattenedConstructors, payloads));
    }

    return this.dispatch(payloads.map((payload) => new EmitterAction(payload)));
  }
}
