# @ngxs-contrib/emitter

This package allows you to get rid of actions to make changes to the store.
You're able to use decorators to register actions directly in your state, you should
not create any actions in your project, as they don't give any profit, only bring extra boilerplate files.

## Emitter Decorator

```TS
import { State } from '@ngxs/store';
import { Emitter, EmitterAction } from '@ngxs-contrib/emitter';

export interface CounterStateModel {
    value: number;
}

@State<CounterStateModel>({
    name: 'counter',
    defaults: {
        value: 0
    }
})
export class CounterState {
    @Emitter()
    public static setValue({ setState }, { payload }: EmitterAction<number>) {
        setState({
            value: payload
        });
    }
}
```

## PayloadEmitter Decorator

```TS
import { Select } from '@ngxs/store';
import { PayloadEmitter, Emittable } from '@ngxs-contrib/emitter';

@Component({
    selector: 'app-counter',
    template: `
        <ng-container *ngIf="count$ | async as count">
            <h3>Count is {{ count.value }}</h3>
            <div class="add-counter">
                <button (click)="counterValue.emit(count.value + 1)">Increment (+1)</button>
                <button (click)="counterValue.emit(count.value - 1)">Decrement (-1)</button>
            </div>
        </ng-container>  
    `
})
export class CounterComponent {
    // Reads the name of the state from the state class
    @Select(CounterState)
    public count$: Observable<number>;

    // Use in components to emit asynchronously payload
    @PayloadEmitter(CounterState.setValue)
    public counterValue: Emittable<number>;
}
```

### Dependency Injection with @Emitter decorator

If you want to subscribe to the changes, you can easily do this. 
You can also use the action method in store. 
Also you can access the dependencies with the injector.

 ```TS
import { State } from '@ngxs/store';
import { Injector } from '@angular/core';
import { Emitter } from '@ngxs-contrib/emitter';

@State<CounterStateModel>({
    name: 'counter',
    defaults: {
        value: 0
    }
})
export class CounterState {
    public static api: ApiService;

    constructor(injector: Injector) {
        CounterState.api = injector.get<ApiService>(ApiService);
    }

    @Emitter()
    public static loadData({ setState }) {
        // Some heavy function
        return apiService.getValueFromServer().pipe(
            tap((value: number) => setState({ value }))
        );
    }
}
```

 ```TS
import { Select } from '@ngxs/store';
import { PayloadEmitter, Emittable } from '@ngxs-contrib/emitter';

@Component({ 
    selector: 'app-count'
    template: `
        <ng-container *ngIf="count$ | async as count">
            <h3>
                Count is {{ count.value }}
                <span *ngIf="isLoading">loading...</span>
            </h3>
            <div class="add-counter">
                <button (click)="loadData()">Load data from server</button>
            </div>
        </ng-container>  
    `
})
export class CounterComponent {
    @Select(CounterState)
    public count$: Observable<CounterStateModel>;

    public isLoading = false;

    @PayloadEmitter(CounterState.loadData)
    public loadData: Emittable<void>;
  
    public loadCountData() {
        this.isLoading = true;

        this.loadData.emit().subscribe(() => {
            this.isLoading = false;
        });
    }
}
```
