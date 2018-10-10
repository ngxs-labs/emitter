import { TestBed } from '@angular/core/testing';
import { Component, Injectable, Injector } from '@angular/core';
import { State, Store, NgxsModule, StateContext } from '@ngxs/store';

import { Observable, of } from 'rxjs';
import { delay, take, tap } from 'rxjs/operators';

import { Receiver } from '../src/lib/core/decorators/receiver';
import { RECEIVER_META_KEY, Emittable } from '../src/lib/core/internal/internals';
import { EmitterAction } from '../src/lib/core/actions/actions';
import { Emitter } from '../src/lib/core/decorators/emitter';
import { NgxsEmitPluginModule } from '../src/lib/emit.module';
import { EmitStore } from '../src/lib/core/services/emit-store.service';

describe('NgxsEmitPluginModule', () => {
    interface Todo {
        text: string;
        completed: boolean;
    }

    it('should throw an error if decorated property is not a function', () => {
        try {
            @State({
                name: 'bar'
            })
            class BarState {
                // @ts-ignore
                @Receiver()
                public a = null;
            }
        } catch ({ message }) {
            expect(message).toBe('Only static functions can be decorated with @Receiver() decorator');
        }
    });

    it('static metadata should have `type` property same as in @Receiver() decorator', () => {
        @State({
            name: 'bar'
        })
        class BarState {
            @Receiver({
                type: '@@[bar]'
            })
            public static foo() {}
        }

        const BarFooMeta = BarState.foo[RECEIVER_META_KEY];
        expect(BarFooMeta.type).toBe('@@[bar]');
    });

    it('static metadata should have default `type` property', () => {
        @State({
            name: 'bar'
        })
        class BarState {
            @Receiver()
            public static foo() {}
        }

        const BarFooMeta = BarState.foo[RECEIVER_META_KEY];
        expect(BarFooMeta.type).toBe('BarState.foo');
    });

    it('should decorate property with @Emitter() decorator', () => {
        @State<Todo[]>({
            name: 'todos',
            defaults: []
        })
        class TodosState {
            @Receiver()
            public static addTodo() {}
        }

        @Component({
            template: ''
        })
        class MockComponent {
            @Emitter(TodosState.addTodo)
            public addTodoAction: Emittable<Todo> | undefined;
        }

        TestBed.configureTestingModule({
            imports: [
                NgxsModule.forRoot([TodosState]),
                NgxsEmitPluginModule.forRoot()
            ],
            declarations: [
                MockComponent
            ]
        });

        const fixture = TestBed.createComponent(MockComponent);
        expect(typeof fixture.componentInstance.addTodoAction).toBe('object');
        expect(typeof fixture.componentInstance.addTodoAction!.emit).toBe('function');
    });

    it('should dispatch an action using property decorated with @Emitter()', () => {
        @State<Todo[]>({
            name: 'todos',
            defaults: []
        })
        class TodosState {
            @Receiver({ type: '@@[Todos] Add todo' })
            public static addTodo(ctx: StateContext<Todo[]>, action: EmitterAction<Todo>) {
                ctx.setState([...ctx.getState(), action.payload!]);
            }
        }

        @Component({
            template: ''
        })
        class MockComponent {
            @Emitter(TodosState.addTodo)
            public addTodoAction: Emittable<Todo> | undefined;
        }

        TestBed.configureTestingModule({
            imports: [
                NgxsModule.forRoot([TodosState]),
                NgxsEmitPluginModule.forRoot()
            ],
            declarations: [
                MockComponent
            ]
        });

        const store: Store = TestBed.get(Store);
        const fixture = TestBed.createComponent(MockComponent);

        fixture.componentInstance.addTodoAction!.emit({
            text: 'buy some coffee',
            completed: false
        });

        const todoLength = store.selectSnapshot<Todo[]>(state => state.todos).length;
        expect(todoLength).toBe(1);
    });

    it('should add todo using @Receiver() decorator', () => {
        @State<Todo[]>({
            name: 'todos',
            defaults: []
        })
        class TodosState {
            @Receiver()
            public static addTodo(ctx: StateContext<Todo[]>, action: EmitterAction<Todo>) {
                ctx.setState([...ctx.getState(), action.payload!]);
            }
        }

        @Component({
            template: ''
        })
        class MockComponent {
            @Emitter(TodosState.addTodo)
            public addTodo: Emittable<Todo> | undefined;
        }

        TestBed.configureTestingModule({
            imports: [
                NgxsModule.forRoot([TodosState]),
                NgxsEmitPluginModule.forRoot()
            ],
            declarations: [
                MockComponent
            ]
        });

        const store: Store = TestBed.get(Store);
        const fixture = TestBed.createComponent(MockComponent);

        fixture.componentInstance.addTodo!.emit({
            text: 'buy coffee',
            completed: false
        });

        const todoLength = store.selectSnapshot<Todo[]>(state => state.todos).length;
        expect(todoLength).toBe(1);
    });

    it('should dispatch an action from the sub state', () => {
        @State({
            name: 'bar2',
            defaults: 10
        })
        class Bar2State {
            @Receiver()
            public static foo2({ setState }: StateContext<number>) {
                setState(20);
            }
        }

        @State({
            name: 'bar',
            defaults: {},
            children: [Bar2State]
        })
        class BarState {}

        @Component({
            template: ''
        })
        class MockComponent {
            @Emitter(Bar2State.foo2)
            public foo2: Emittable<void> | undefined;
        }

        TestBed.configureTestingModule({
            imports: [
                NgxsModule.forRoot([BarState, Bar2State]),
                NgxsEmitPluginModule.forRoot()
            ],
            declarations: [
                MockComponent
            ]
        });

        const store: Store = TestBed.get(Store);
        const fixture = TestBed.createComponent(MockComponent);

        fixture.componentInstance.foo2!.emit();

        const bar2Value = store.selectSnapshot(state => state.bar).bar2;
        expect(bar2Value).toBe(20);
    });

    it('should throw an error that such `type` already exists', () => {
        try {
            @State({
                name: 'bar',
                defaults: 10
            })
            class BarState {
                @Receiver({
                    type: 'foo'
                })
                public static foo1() {}

                @Receiver({
                    type: 'foo'
                })
                public static foo2() {}
            }

            TestBed.configureTestingModule({
                imports: [
                    NgxsModule.forRoot([BarState]),
                    NgxsEmitPluginModule.forRoot()
                ]
            });
        } catch ({ message }) {
            expect(message).toBe('Method decorated with such type `foo` already exists');
        }
    });

    it('should throw an error if an action passed to the @Receiver() does not have static `type` property', () => {
        class FooAction {}

        try {
            @State({
                name: 'bar'
            })
            class BarState {
                @Receiver({
                    action: FooAction
                })
                public static foo() {}
            }
        } catch ({ message }) {
            expect(message).toBe('Action type should be defined as a static property `type`');
        }
    });

    it('should be able to use @Receiver() with symbol-key methods', () => {
        const symbol = Symbol.for('foo');

        @State({
            name: 'bar'
        })
        class BarState {
            @Receiver()
            public static [symbol]() {}
        }

        expect(BarState[symbol][RECEIVER_META_KEY].type).toBe('BarState.Symbol(foo)');
    });

    it('EmitStore.prototype.emitter should return an emittable object', () => {
        @State({
            name: 'bar'
        })
        class BarState {
            @Receiver()
            public static foo() {}
        }

        TestBed.configureTestingModule({
            imports: [
                NgxsModule.forRoot([BarState]),
                NgxsEmitPluginModule.forRoot()
            ]
        });

        const store: EmitStore = TestBed.get(EmitStore);

        expect(typeof store.emitter(BarState.foo)).toBe('object');
        expect(typeof store.emitter(BarState.foo).emit).toBe('function');
    });

    it('should dispatch an action using @Receiver() after delay', () => {
        @Injectable()
        class ApiService {
            private size = 10;

            public getTodosFromServer(length: number): Observable<Todo[]> {
                return of(this.generateTodoMock(length)).pipe(delay(1000));
            }

            private generateTodoMock(size?: number): Todo[] {
                const length = size || this.size;
                return Array.from({ length }).map(() => ({
                    text: 'buy some coffee',
                    completed: false
                }));
            }
        }

        @State<Todo[]>({
            name: 'todos',
            defaults: []
        })
        class TodosState {
            public static api: ApiService = null!;

            constructor(injector: Injector) {
                TodosState.api = injector.get<ApiService>(ApiService);
            }

            @Receiver({
                type: '@@[Todos] Set todos sync'
            })
            public static async setTodosSync({ setState }: StateContext<Todo[]>) {
                setState(
                    await TodosState.api
                        .getTodosFromServer(10)
                        .toPromise()
                );
            }

            @Receiver({
                type: '@@[Todos] Set todos'
            })
            public static setTodos({ setState }: StateContext<Todo[]>) {
                return TodosState.api
                    .getTodosFromServer(5)
                    .pipe(
                        take(1),
                        tap(todos => setState(todos))
                    );
            }
        }

        @Component({
            template: ''
        })
        class MockComponent {
            @Emitter(TodosState.setTodosSync)
            public setTodosSync: Emittable<Todo[]> | undefined;

            @Emitter(TodosState.setTodos)
            public setTodos: Emittable<Todo[]> | undefined;
        }

        TestBed.configureTestingModule({
            imports: [
                NgxsModule.forRoot([TodosState]),
                NgxsEmitPluginModule.forRoot()
            ],
            declarations: [
                MockComponent
            ],
            providers: [
                ApiService
            ]
        });

        const store: Store = TestBed.get(Store);
        const fixture = TestBed.createComponent(MockComponent);

        fixture.componentInstance.setTodosSync!.emit().subscribe(() => {
            const todoLength = store.selectSnapshot<Todo[]>(state => state.todos).length;
            expect(todoLength).toBe(10);
        });

        fixture.componentInstance.setTodos!.emit().subscribe(() => {
            const todoLength = store.selectSnapshot<Todo[]>(state => state.todos).length;
            expect(todoLength).toBe(5);
        });
    });

    it('should be possible to pass an action into @Receiver() decorator', () => {
        class AddTodo {
            public static type = '@@[Todos] Add todo';
            constructor(public payload: Todo) {}
        }

        @State<Todo[]>({
            name: 'todos',
            defaults: []
        })
        class TodosState {
            @Receiver({
                action: AddTodo
            })
            public static addTodo({ setState, getState }: StateContext<Todo[]>, { payload }: AddTodo) {
                setState([...getState(), payload]);
            }
        }

        @Component({
            template: ''
        })
        class MockComponent {
            @Emitter(TodosState.addTodo)
            public addTodoAction: Emittable<Todo> | undefined;
        }

        TestBed.configureTestingModule({
            imports: [
                NgxsModule.forRoot([TodosState]),
                NgxsEmitPluginModule.forRoot()
            ],
            declarations: [
                MockComponent
            ]
        });

        const store: Store = TestBed.get(Store);
        const fixture = TestBed.createComponent(MockComponent);

        fixture.componentInstance.addTodoAction!.emit({
            text: 'buy coffee',
            completed: false
        });

        const todos = store.selectSnapshot<Todo[]>(state => state.todos);
        expect(todos.length).toBe(1);
    });
});
