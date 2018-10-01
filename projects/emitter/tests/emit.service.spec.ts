import { TestBed } from '@angular/core/testing';
import { NgxsModule, Store } from '@ngxs/store';

import { EmitStore } from '../src/lib/emit.service';
import { NgxsEmitPluginModule } from '../src/lib/emit.module';

describe('EmitStore', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                NgxsModule.forRoot(),
                NgxsEmitPluginModule.forRoot()
            ]
        });
    });

    it('EmitStore should be defined', () => {
        const store: EmitStore = TestBed.get(EmitStore);
        expect(store.constructor).toBe(EmitStore);
    });

    it('EmitStore should override Store token by reference', () => {
        const store: EmitStore = TestBed.get(Store);
        expect(store.constructor).toBe(EmitStore);
    });
});
