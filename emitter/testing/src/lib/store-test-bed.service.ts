import { Injectable } from '@angular/core';
import { EmitStore, Emittable } from '@ngxs-labs/emitter';

@Injectable()
export class StoreTestBed {
    constructor(private emitStore: EmitStore) {}

    public action<T = any, U = any>(receiver: Function): Emittable<T, U> {
        return this.emitStore.emitter(receiver);
    }
}
