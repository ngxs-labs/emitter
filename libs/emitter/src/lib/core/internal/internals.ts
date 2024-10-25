import { Type } from '@angular/core';
import type { ActionStatus, StateContext } from '@ngxs/store';

import { Observable } from 'rxjs';
export type Action<T> = Type<T> & {
  type: string;
};

export interface ReceiverMetaData<T extends Function = any> {
  type: string;
  payload: any;
  action: Action<T> | Action<T>[];
  cancelUncompleted: boolean;
}

export interface Emittable<T = void> {
  emit(payload: T): Observable<void>;
  emitMany(payloads: T[]): Observable<void>;
}

export interface ActionContext {
  status: ActionStatus;
  action: any;
  error?: Error;
}

export interface OfEmittableActionContext<T = void> {
  type: string;
  payload: T;
  error?: Error;
}

export interface Types {
  [key: string]: boolean;
}

export type ActionHandler = (ctx?: StateContext<any>, action?: any) => void | Observable<any>;

export const RECEIVER_META_KEY = 'NGXS_RECEIVER_META';

export function constructEventsForSingleDispatching<T>(
  constructors: Type<any>[],
  payload: T | undefined
): any {
  return constructors.map(constructor => Reflect.construct(constructor, [payload]));
}

export function constructEventsForManyDispatching<T>(
  constructors: Type<any>[],
  payloads: T[]
): any {
  const events = [];

  for (const constructor of constructors) {
    for (const payload of payloads) {
      events.push(Reflect.construct(constructor, [payload]));
    }
  }

  return events;
}
