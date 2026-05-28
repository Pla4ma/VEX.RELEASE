import { captureException } from "../../config/sentry";

export class EventEmitter<Events extends object> {
  private listeners: Map<keyof Events, Array<(data: unknown) => void>> =
    new Map();

  subscribe<K extends keyof Events>(
    event: K,
    callback: (data: Events[K]) => void,
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    const callbacks = this.listeners.get(event)!;
    const wrappedCallback = (data: unknown) => callback(data as Events[K]);
    callbacks.push(wrappedCallback);
    return () => {
      const index = callbacks.indexOf(wrappedCallback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          captureException(
            e instanceof Error
              ? e
              : new Error(`Event listener error for ${String(event)}`),
            { area: "content-study.events.emit", event: String(event) },
          );
        }
      });
    }
  }

  once<K extends keyof Events>(
    event: K,
    callback: (data: Events[K]) => void,
  ): () => void {
    const unsubscribe = this.subscribe(event, (data) => {
      unsubscribe();
      callback(data);
    });
    return unsubscribe;
  }

  clearAll(): void {
    this.listeners.clear();
  }
}
