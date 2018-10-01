import { TestBed } from '@angular/core/testing';
import { NgxsModule } from '@ngxs/store';

import { EmitStore } from '../src/lib/emit.service';

describe('EmitStore', () => {
    let store: EmitStore | null = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                NgxsModule.forRoot()
            ],
            providers: [
                EmitStore
            ]
        });

        store = TestBed.get(EmitStore);
    });

    it('`EmitStore` should be defined', () => {
        expect(store !.constructor).toBe(EmitStore);
    });
});
