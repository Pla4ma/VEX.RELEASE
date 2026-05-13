import { createDebugger } from "../utils/debug";


export const globalEventEmitter = EventEmitter.getInstance();

export function createNamespacedEmitter(namespace: string): EventEmitter {
  const baseEmitter = EventEmitter.getInstance();

  return {
    on: <T>(event: string, handler: EventHandler<T>, options?: { once?: boolean; priority?: number }) => baseEmitter.on(`${namespace}:${event}`, handler, options),

    once: <T>(event: string, handler: EventHandler<T>) => baseEmitter.once(`${namespace}:${event}`, handler),

    off: <T>(event: string, handler?: EventHandler<T>) => baseEmitter.off(`${namespace}:${event}`, handler),

    emit: <T>(event: string, data: T) => baseEmitter.emit(`${namespace}:${event}`, data),

    emitAsync: <T>(event: string, data: T) => baseEmitter.emitAsync(`${namespace}:${event}`, data),

    hasListeners: (event: string) => baseEmitter.hasListeners(`${namespace}:${event}`),

    listenerCount: (event: string) => baseEmitter.listenerCount(`${namespace}:${event}`),

    eventNames: () =>
      baseEmitter
        .eventNames()
        .filter((name) => name.startsWith(`${namespace}:`))
        .map((name) => name.replace(`${namespace}:`, '')),

    removeAllListeners: (event?: string) =>
      event
        ? baseEmitter.removeAllListeners(`${namespace}:${event}`)
        : baseEmitter
            .eventNames()
            .filter((name) => name.startsWith(`${namespace}:`))
            .forEach((name) => baseEmitter.removeAllListeners(name)),
  } as EventEmitter;
}