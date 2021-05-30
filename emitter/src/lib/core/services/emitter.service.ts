import { Injectable } from '@angular/core';

import { EmitStore } from './emit-store.service';
import { Emittable } from '../internal/internals';

@Injectable()
export class EmitterService {
  constructor(private emitStore: EmitStore) {}

  action<T = void, U = any>(receiver: Function): Emittable<T, U> {
    return this.emitStore.emitter(receiver);
  }
}
