import { NgModule, Type, ModuleWithProviders } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { NgxsEmitPluginModule } from '@ngxs-labs/emitter';

@NgModule()
export class StoreTestBedModule {
    /**
     * This module provides easy-testing flow for `NgxsEmitPluginModule`
     */
    public static configureTestingModule(states: Type<any>[] = []): ModuleWithProviders[] {
        return [NgxsModule.forRoot(states), NgxsEmitPluginModule.forRoot()].concat({
            ngModule: StoreTestBedModule
        });
    }
}
