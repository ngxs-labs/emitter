import { NgModule, ModuleWithProviders } from '@angular/core';
import { Store } from '@ngxs/store';

import { PayloadEmitterFactory } from './core/decorators/payload-emitter';
import { EmitStore } from './emit.service';

@NgModule()
export class NgxsEmitPluginModule {
    constructor(payloadEmitterFactory: PayloadEmitterFactory) {}

    /**
     * @returns a wrapper around `NgModule`
     */
    public static forRoot(): ModuleWithProviders<NgxsEmitPluginModule> {
        return {
            ngModule: NgxsEmitPluginModule,
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
