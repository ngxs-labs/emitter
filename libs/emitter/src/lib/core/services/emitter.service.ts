import { Injectable } from '@angular/core';

import { EmitStore } from './emit-store.service';
import { Emittable } from '../internal/internals';

@Injectable()
export class EmitterService {
  constructor(private _emitStore: EmitStore) {}

  action<T = void>(receiver: Function): Emittable<T> {
    return this._emitStore.emitter(receiver);
  }
}
