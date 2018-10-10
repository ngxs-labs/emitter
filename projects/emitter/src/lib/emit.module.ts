import { NgModule, ModuleWithProviders, Self } from '@angular/core';

import { EmitStore } from './core/services/emit-store.service';
import { InjectorAccessor } from './core/services/injector-accessor.service';

@NgModule({
    providers: [
        EmitStore,
        InjectorAccessor
    ]
})
export class NgxsEmitPluginModule {
    constructor(
        @Self()
        injectorAccessor: InjectorAccessor
    ) {}

    /**
     * @returns - A wrapper around `NgModule`
     */
    public static forRoot(): ModuleWithProviders<NgxsEmitPluginModule> {
        return {
            ngModule: NgxsEmitPluginModule
        };
    }
}
