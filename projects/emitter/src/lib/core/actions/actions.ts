/**
 * Emitter action
 */
export class EmitterAction<T = any> {
    static type: string | null = null;
    constructor(public payload?: T) {}
}
