import { TestBed } from '@angular/core/testing';
import { State, StateContext, Store } from '@ngxs/store';
import { Receiver, EmitterService } from '@ngxs-labs/emitter';

import { StoreTestBedModule } from '../lib/store-test-bed.module';

describe(StoreTestBedModule.name, () => {
  it('should configure easy testing module', () => {
    @State<number>({
      name: 'counter',
      defaults: 0
    })
    class CounterState {
      @Receiver()
      public static increment({ setState, getState }: StateContext<number>): void {
        setState(getState() + 1);
      }

      @Receiver()
      public static decrement({ setState, getState }: StateContext<number>): void {
        setState(getState() - 1);
      }
    }

    TestBed.configureTestingModule({
      imports: [StoreTestBedModule.configureTestingModule([CounterState])]
    });

    const store: Store = TestBed.inject(Store);
    const emitter: EmitterService = TestBed.inject(EmitterService);

    emitter.action(CounterState.increment).emit();
    emitter.action(CounterState.increment).emit();
    emitter.action(CounterState.increment).emit();
    emitter.action(CounterState.decrement).emit();

    const counter = store.selectSnapshot<number>(({ counter }) => counter);
    expect(counter).toEqual(2);
  });
});
