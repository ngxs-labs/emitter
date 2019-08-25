/**
 * This class is used as a default action when the user doesn't pass any custom action as an argument
 */
export class EmitterAction<T = void> {
  /**
   * Creates EmitterAction instance
   *
   * @param payload - Data to dispatch
   * @param type - Action type
   */
  constructor(public payload: T, public type: string | null = null) {}
}
