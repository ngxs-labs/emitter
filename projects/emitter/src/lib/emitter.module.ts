/// <reference path="../../typings.d.ts"/>

import { NgModule, ModuleWithProviders } from '@angular/core';
import { Store } from '@ngxs/store';

import { Observable } from 'rxjs';

import { EmitPayloadFactory } from './core/decorators/emit-payload';
import { EmitterAction } from './core/actions/actions';
import { EMITTER_META_KEY } from './core/internal/internals';

@NgModule()
export class EmitterModule {
    constructor(emitPayloadFactory: EmitPayloadFactory) {}

    public static forRoot(): ModuleWithProviders<EmitterModule> {
        return {
            ngModule: EmitterModule,
            providers: [
                EmitPayloadFactory
            ]
        };
    }
}

if (typeof Store.prototype.emitter !== 'function') {
    Store.prototype.emitter = function<T = any, U = any>(emitter: Function) {
        const emitterEvent = emitter[EMITTER_META_KEY];

        if (!emitterEvent) {
            throw new Error('Emitter methods should be decorated using @Emitter() decorator');
        }

        return {
            emit(payload?: T): Observable<U> {
                EmitterAction.type = emitterEvent.type;
                const action = new EmitterAction<T>(payload);
                // @ts-ignore
                return this['_internalStateOperations'].getRootStateOperations().dispatch<EmitterAction>(action);
            }
        };
    };
}
