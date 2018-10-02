import { NgModule, ModuleWithProviders } from '@angular/core';

import { PayloadEmitterFactory } from './core/decorators/payload-emitter';
import { EmitStore } from './emit.service';

@NgModule({
    providers: [
        PayloadEmitterFactory,
        EmitStore
    ]
})
export class NgxsEmitPluginModule {
    constructor(payloadEmitterFactory: PayloadEmitterFactory) {}

    /**
     * @returns - A wrapper around `NgModule`
     */
    public static forRoot(): ModuleWithProviders<NgxsEmitPluginModule> {
        return {
            ngModule: NgxsEmitPluginModule
        };
    }
}
