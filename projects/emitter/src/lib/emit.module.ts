import { NgModule, ModuleWithProviders } from '@angular/core';

import { InjectorAccessor } from './core/services/injector-accessor.service';
import { EmitStore } from './core/services/emit-store.service';

@NgModule({
    providers: [
        InjectorAccessor,
        EmitStore
    ]
})
export class NgxsEmitPluginModule {
    constructor(injectorAccessor: InjectorAccessor) {}

    /**
     * @returns - A wrapper around `NgModule`
     */
    public static forRoot(): ModuleWithProviders<NgxsEmitPluginModule> {
        return {
            ngModule: NgxsEmitPluginModule
        };
    }
}
