/**
 * This class is used as a default action when the user doesn't pass any custom action as an argument
 */
export class EmitterAction<T = any> {
  /**
   * Action type
   */
  public static type: string | null = null;

  /**
   * Creates EmitterAction instance
   *
   * @param payload - Data to dispatch
   */
  constructor(public payload?: T) {}
}
