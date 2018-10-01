import { NgModule, ModuleWithProviders } from '@angular/core';
import { Store } from '@ngxs/store';

import { PayloadEmitterFactory } from './core/decorators/payload-emitter';
import { EmitStore } from './emit.service';

@NgModule()
export class EmitModule {
    constructor(payloadEmitterFactory: PayloadEmitterFactory) {}

    /**
     * @returns a wrapper around `NgModule`
     */
    public static forRoot(): ModuleWithProviders<EmitModule> {
        return {
            ngModule: EmitModule,
            providers: [
                PayloadEmitterFactory,
                EmitStore,
                {
                    provide: Store,
                    useClass: EmitStore
                }
            ]
        };
    }
}
