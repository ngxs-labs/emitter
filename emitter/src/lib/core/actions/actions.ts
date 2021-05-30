/**
 * This class is used as a default action when
 * the user doesn't pass any custom action as an argument
 */
export class EmitterAction<T = void> {
  constructor(public payload: T, public type: string | null = null) {}
}
