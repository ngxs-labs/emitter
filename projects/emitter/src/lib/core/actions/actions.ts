/**
 * Emitter action
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
