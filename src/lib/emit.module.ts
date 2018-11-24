import { NgModule, ModuleWithProviders, Self } from '@angular/core';

import { EmitStore } from './core/services/emit-store.service';
import { InjectorAccessor } from './core/services/injector-accessor.service';

@NgModule()
export class NgxsEmitPluginModule {
    constructor(@Self() private injectorAccessor: InjectorAccessor) {}

    /**
     * @returns - A wrapper around `NgModule`
     */
    public static forRoot(): ModuleWithProviders<NgxsEmitPluginModule> {
        return {
            ngModule: NgxsEmitPluginModule,
            providers: [EmitStore, InjectorAccessor]
        };
    }
}
