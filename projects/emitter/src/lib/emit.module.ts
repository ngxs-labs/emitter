import { NgModule, ModuleWithProviders } from '@angular/core';
import { Store } from '@ngxs/store';

import { PayloadEmitterFactory } from './core/decorators/payload-emitter';
import { EmitStore } from './emit.service';

@NgModule()
export class EmitterModule {
    constructor(payloadEmitterFactory: PayloadEmitterFactory) {}

    /**
     * @returns a wrapper around `NgModule`
     */
    public static forRoot(): ModuleWithProviders<EmitterModule> {
        return {
            ngModule: EmitterModule,
            providers: [
                PayloadEmitterFactory,
                {
                    provide: Store,
                    useClass: EmitStore
                }
            ]
        };
    }
}
