import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Actions, NgxsModule, State, StateContext, ofActionDispatched } from '@ngxs/store';

import { throwError } from 'rxjs';

import { Emitter } from '../src/lib/core/decorators/emitter';
import { PayloadEmitter } from '../src/lib/core/decorators/payload-emitter';
import { Emittable, OfEmittableActionContext } from '../src/lib/core/internal/internals';
import { NgxsEmitPluginModule } from '../src/lib/emit.module';
import {
    ofEmittableDispatched, ofEmittableErrored
} from '../src/lib/core/operators/of-emittable';

describe('Actions', () => {
    it('should intercept only CounterState.increment emitter', () => {
        @State<number>({
            name: 'counter',
            defaults: 0
        })
        class CounterState {
            @Emitter()
            public static increment({ setState, getState }: StateContext<number>) {
                setState(getState() + 1);
            }

            @Emitter()
            public static decrement({ setState, getState }: StateContext<number>) {
                setState(getState() - 1);
            }

            @Emitter()
            public static multiplyBy2({ setState, getState }: StateContext<number>) {
                setState(getState() * 2);
            }
        }

        @Component({
            template: ''
        })
        class MockComponent {
            @PayloadEmitter(CounterState.increment)
            public increment: Emittable<number> | undefined;

            @PayloadEmitter(CounterState.decrement)
            public decrement: Emittable<void> | undefined;

            @PayloadEmitter(CounterState.multiplyBy2)
            public multiplyBy2: Emittable<void> | undefined;
        }

        TestBed.configureTestingModule({
            imports: [
                NgxsModule.forRoot([CounterState]),
                NgxsEmitPluginModule.forRoot()
            ],
            declarations: [
                MockComponent
            ]
        });

        const fixture = TestBed.createComponent(MockComponent);
        const actions$: Actions = TestBed.get(Actions);

        actions$.pipe(
            ofEmittableDispatched(CounterState.increment)
        ).subscribe(({ type, payload }: OfEmittableActionContext<number>) => {
            expect(type).toBe('CounterState.increment');
            expect(payload).toBe(20);
        });

        fixture.componentInstance.decrement!.emit();
        fixture.componentInstance.increment!.emit(20);
        fixture.componentInstance.multiplyBy2!.emit();
    });

    it('should intercept errored emitter', () => {
        @State<number>({
            name: 'counter',
            defaults: 0
        })
        class CounterState {
            @Emitter()
            public static increment() {
                return throwError(new Error('Whoops!'));
            }
        }

        @Component({
            template: ''
        })
        class MockComponent {
            @PayloadEmitter(CounterState.increment)
            public increment: Emittable<void> | undefined;
        }

        TestBed.configureTestingModule({
            imports: [
                NgxsModule.forRoot([CounterState]),
                NgxsEmitPluginModule.forRoot()
            ],
            declarations: [
                MockComponent
            ]
        });

        const fixture = TestBed.createComponent(MockComponent);
        const actions$: Actions = TestBed.get(Actions);

        actions$.pipe(
            ofEmittableErrored(CounterState.increment)
        ).subscribe(({ type, payload }: OfEmittableActionContext<void>) => {
            expect(type).toBe('CounterState.increment');
            expect(payload).toBe(undefined);
        });

        fixture.componentInstance.increment!.emit();
    });
});
