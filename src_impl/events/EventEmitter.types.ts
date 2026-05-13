/**
 * Event handler function type
 */
export type EventHandler<T = unknown> = (data: T) => void | Promise<void> | Promise<unknown>;
