import { Component, Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Actions, NgxsModule, State, StateContext, ofActionDispatched, Store } from '@ngxs/store';

import { throwError } from 'rxjs';
import { take, finalize } from 'rxjs/operators';

import { Receiver } from '../lib/core/decorators/receiver';
import { Emitter } from '../lib/core/decorators/emitter';
import { Emittable, OfEmittableActionContext } from '../lib/core/internal/internals';
import { NgxsEmitPluginModule } from '../lib/emit.module';
import {
  ofEmittableDispatched,
  ofEmittableErrored,
  ofEmittableSuccessful,
  ofEmittableCanceled
} from '../lib/core/operators/of-emittable';

describe('Actions', () => {
  @State<number>({
    name: 'counter',
    defaults: 0
  })
  @Injectable()
  class CounterState {
    @Receiver()
    static increment({ setState, getState }: StateContext<number>) {
      setState(getState() + 1);
    }

    @Receiver()
    static decrement({ setState, getState }: StateContext<number>) {
      setState(getState() - 1);
    }

    @Receiver()
    static multiplyBy2({ setState, getState }: StateContext<number>) {
      setState(getState() * 2);
    }

    @Receiver()
    static throwError() {
      return throwError(() => new Error('Whoops!'));
    }
  }

  @Component({
    template: ''
  })
  class MockComponent {
    @Emitter(CounterState.increment)
    public increment?: Emittable<void | number>;

    @Emitter(CounterState.decrement)
    public decrement?: Emittable<void | number>;

    @Emitter(CounterState.multiplyBy2)
    public multiplyBy2?: Emittable<void | number>;

    @Emitter(CounterState.throwError)
    public throwError?: Emittable;
  }

  it('ofEmittable operators should return factories', () => {
    [
      ofEmittableDispatched(),
      ofEmittableSuccessful(),
      ofEmittableErrored(),
      ofEmittableCanceled()
    ].forEach(factory => {
      expect(factory.length).toBe(1);
    });
  });

  it('should intercept custom action that is defined in the @Receiver() decorator', () => {
    class Increment {
      static type = '[Counter] Increment';
    }

    class Decrement {
      static type = '[Counter] Decrement';
    }

    class MultiplyBy2 {
      static type = '[Counter] Multiply by 2';
    }

    @State<number>({
      name: 'counter',
      defaults: 0
    })
    @Injectable()
    class CounterStateWithCustomActions {
      @Receiver({
        action: Increment
      })
      static increment({ setState, getState }: StateContext<number>) {
        setState(getState() + 1);
      }

      @Receiver({
        action: Decrement
      })
      static decrement({ setState, getState }: StateContext<number>) {
        setState(getState() - 1);
      }

      @Receiver({
        action: MultiplyBy2
      })
      static multiplyBy2({ setState, getState }: StateContext<number>) {
        setState(getState() * 2);
      }
    }

    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([CounterStateWithCustomActions]),
        NgxsEmitPluginModule.forRoot()
      ],
      teardown: { destroyAfterEach: false }
    });

    const store: Store = TestBed.inject(Store);
    const actions$: Actions = TestBed.inject(Actions);

    actions$.pipe(ofActionDispatched(Increment)).subscribe(action => {
      expect(action.constructor).toBe(Increment);
    });

    store.dispatch(new Increment());
    store.dispatch(new Decrement());
    store.dispatch(new MultiplyBy2());
  });

  it('should intercept only CounterState.increment receiver', () => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([CounterState]), NgxsEmitPluginModule.forRoot()],
      declarations: [MockComponent],
      teardown: { destroyAfterEach: false }
    });

    const fixture = TestBed.createComponent(MockComponent);
    const actions$: Actions = TestBed.inject(Actions);

    actions$
      .pipe(ofEmittableDispatched(CounterState.increment))
      .subscribe(({ payload }: OfEmittableActionContext<number>) => {
        expect(payload).toBe(20);
      });

    fixture.componentInstance.decrement!.emit();
    fixture.componentInstance.increment!.emit(20);
    fixture.componentInstance.multiplyBy2!.emit();
  });

  it('should intercept receiver that throws an error', () => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([CounterState]), NgxsEmitPluginModule.forRoot()],
      declarations: [MockComponent],
      teardown: { destroyAfterEach: false }
    });

    const fixture = TestBed.createComponent(MockComponent);
    const actions$: Actions = TestBed.inject(Actions);

    actions$
      .pipe(ofEmittableErrored(CounterState.throwError))
      .subscribe(({ payload, error }: OfEmittableActionContext) => {
        expect(payload).toBe(undefined);
        expect(error!.message).toBe('Whoops!');
      });

    fixture.componentInstance.increment!.emit();
    fixture.componentInstance.decrement!.emit();
    fixture.componentInstance.throwError!.emit();
    fixture.componentInstance.multiplyBy2!.emit();
  });

  it('should intercept multiple dispatched emittables', () => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([CounterState]), NgxsEmitPluginModule.forRoot()],
      declarations: [MockComponent],
      teardown: { destroyAfterEach: false }
    });

    const fixture = TestBed.createComponent(MockComponent);
    const actions$: Actions = TestBed.inject(Actions);
    const types: string[] = [];

    actions$
      .pipe(
        ofEmittableDispatched(CounterState.increment, CounterState.decrement),
        take(4),
        finalize(() => {
          expect(types).toContain('CounterState.increment');
          expect(types).toContain('CounterState.decrement');
        })
      )
      .subscribe(({ type }: OfEmittableActionContext) => {
        types.push(type);
      });

    fixture.componentInstance.increment!.emit();
    fixture.componentInstance.decrement!.emit();
    fixture.componentInstance.multiplyBy2!.emit();
    fixture.componentInstance.throwError!.emit();
  });

  it('should intercept multiple successful emittables', () => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([CounterState]), NgxsEmitPluginModule.forRoot()],
      declarations: [MockComponent],
      teardown: { destroyAfterEach: false }
    });

    const fixture = TestBed.createComponent(MockComponent);
    const actions$: Actions = TestBed.inject(Actions);
    const types: string[] = [];

    actions$
      .pipe(
        ofEmittableSuccessful(
          CounterState.increment,
          CounterState.decrement,
          CounterState.multiplyBy2
        ),
        take(3),
        finalize(() => {
          ['CounterState.increment', 'CounterState.decrement', 'CounterState.multiplyBy2'].forEach(
            (type, index) => {
              const typeContainsClassName = types[index].indexOf(type) > -1;
              expect(typeContainsClassName).toBeTruthy();
            }
          );
        })
      )
      .subscribe(({ type }: OfEmittableActionContext) => {
        types.push(type);
      });

    fixture.componentInstance.throwError!.emit();
    fixture.componentInstance.increment!.emit();
    fixture.componentInstance.decrement!.emit();
    fixture.componentInstance.multiplyBy2!.emit();
  });

  describe('Receivers interaction', () => {
    @State<number>({
      name: 'counter',
      defaults: 0
    })
    @Injectable()
    class CounterState {
      @Receiver()
      static increment(ctx: StateContext<number>) {
        ctx.setState(ctx.getState() + 1);
      }

      @Receiver()
      static decrement(ctx: StateContext<number>) {
        ctx.setState(ctx.getState() - 1);
      }

      @Receiver()
      static dontChange() {
        CounterService.increment.emit();
        CounterService.decrement.emit();
      }
    }

    class CounterService {
      @Emitter(CounterState.increment)
      static increment: Emittable<void>;

      @Emitter(CounterState.decrement)
      static decrement: Emittable<void>;

      @Emitter(CounterState.dontChange)
      static dontChange: Emittable<void>;
    }

    it('should dispatch actions to correct receivers', () => {
      // Arrange
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([CounterState]), NgxsEmitPluginModule.forRoot()],
        declarations: [MockComponent],
        teardown: { destroyAfterEach: false }
      });

      // Act
      const store: Store = TestBed.inject(Store);
      const actions$: Actions = TestBed.inject(Actions);

      let emittedTimes = 0;

      actions$
        .pipe(
          ofEmittableSuccessful(
            CounterState.dontChange,
            CounterState.increment,
            CounterState.decrement
          ),
          take(3)
        )
        .subscribe(() => {
          emittedTimes++;
        });

      CounterService.dontChange.emit();

      const counter: number = store.selectSnapshot(CounterState);

      // Assert
      expect(counter).toBe(0);
      expect(emittedTimes).toBe(3);
    });
  });
});
