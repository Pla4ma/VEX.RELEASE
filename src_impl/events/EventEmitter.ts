/**
 * Event Emitter
 *
 * Core event emitter implementation for the VEX application.
 * Provides pub/sub pattern for cross-component communication.
 */

import { createDebugger } from '../utils/debug';

const debug = createDebugger('events');

/**
 * Event handler function type
 */
export type EventHandler<T = unknown> = (data: T) => void | Promise<void> | Promise<unknown>;

/**
 * Event subscription
 */
interface EventSubscription<T = unknown> {
  event: string;
  handler: EventHandler<T>;
  once: boolean;
  priority: number;
}

/**
 * Event Emitter class
 *
 * Implements the pub/sub pattern for decoupled communication.
 */
export class EventEmitter {
  private subscriptions: Map<string, EventSubscription[]> = new Map();
  private static instance: EventEmitter | null = null;

  /**
   * Get singleton instance
   */
  static getInstance(): EventEmitter {
    if (!EventEmitter.instance) {
      EventEmitter.instance = new EventEmitter();
    }
    return EventEmitter.instance;
  }

  /**
   * Subscribe to an event
   *
   * @param event - Event name
   * @param handler - Event handler function
   * @param options - Subscription options
   * @returns Unsubscribe function
   */
  on<T = unknown>(event: string, handler: EventHandler<T>, options: { once?: boolean; priority?: number } = {}): () => void {
    const subscription: EventSubscription<T> = {
      event,
      handler: handler as EventHandler<unknown>,
      once: options.once ?? false,
      priority: options.priority ?? 0,
    };

    const existing = this.subscriptions.get(event) ?? [];
    existing.push(subscription as EventSubscription<unknown>);

    // Sort by priority (higher first)
    existing.sort((a, b) => b.priority - a.priority);

    this.subscriptions.set(event, existing);

    // Return unsubscribe function
    return () => this.off(event, handler);
  }

  /**
   * Subscribe to an event once
   *
   * @param event - Event name
   * @param handler - Event handler function
   * @returns Unsubscribe function
   */
  once<T = unknown>(event: string, handler: EventHandler<T>): () => void {
    return this.on(event, handler, { once: true });
  }

  /**
   * Unsubscribe from an event
   *
   * @param event - Event name
   * @param handler - Handler to remove (optional - removes all if not provided)
   */
  off<T = unknown>(event: string, handler?: EventHandler<T>): void {
    const existing = this.subscriptions.get(event);

    if (!existing) {
      return;
    }

    if (handler) {
      const filtered = existing.filter((sub) => sub.handler !== (handler as EventHandler<unknown>));
      this.subscriptions.set(event, filtered);
    } else {
      this.subscriptions.delete(event);
    }
  }

  /**
   * Emit an event
   *
   * @param event - Event name
   * @param data - Event data
   */
  emit<T = unknown>(event: string, data: T): void {
    const subscriptions = this.subscriptions.get(event);

    if (!subscriptions || subscriptions.length === 0) {
      return;
    }

    // Create a copy to avoid issues if handlers modify subscriptions
    const toCall = [...subscriptions];

    // Track subscriptions to remove (once handlers)
    const toRemove: EventSubscription[] = [];

    for (const subscription of toCall) {
      try {
        subscription.handler(data);

        if (subscription.once) {
          toRemove.push(subscription);
        }
      } catch (error) {
        this.handleError(error, event, data);
      }
    }

    // Remove once handlers
    if (toRemove.length > 0) {
      const remaining = subscriptions.filter((sub) => !toRemove.includes(sub));

      if (remaining.length > 0) {
        this.subscriptions.set(event, remaining);
      } else {
        this.subscriptions.delete(event);
      }
    }
  }

  /**
   * Emit an event asynchronously
   *
   * @param event - Event name
   * @param data - Event data
   * @returns Promise that resolves when all handlers complete
   */
  async emitAsync<T = unknown>(event: string, data: T): Promise<void> {
    const subscriptions = this.subscriptions.get(event);

    if (!subscriptions || subscriptions.length === 0) {
      return;
    }

    const toCall = [...subscriptions];
    const toRemove: EventSubscription[] = [];

    for (const subscription of toCall) {
      try {
        const result = subscription.handler(data);

        // Handle async handlers
        if (result && typeof result === 'object' && 'then' in result && typeof (result as Promise<unknown>).then === 'function') {
          await (result as Promise<unknown>);
        }

        if (subscription.once) {
          toRemove.push(subscription);
        }
      } catch (error) {
        this.handleError(error, event, data);
      }
    }

    // Remove once handlers
    if (toRemove.length > 0) {
      const remaining = subscriptions.filter((sub) => !toRemove.includes(sub));

      if (remaining.length > 0) {
        this.subscriptions.set(event, remaining);
      } else {
        this.subscriptions.delete(event);
      }
    }
  }

  /**
   * Check if an event has listeners
   *
   * @param event - Event name
   * @returns True if event has listeners
   */
  hasListeners(event: string): boolean {
    const subscriptions = this.subscriptions.get(event);
    return subscriptions !== undefined && subscriptions.length > 0;
  }

  /**
   * Get number of listeners for an event
   *
   * @param event - Event name
   * @returns Number of listeners
   */
  listenerCount(event: string): number {
    return this.subscriptions.get(event)?.length ?? 0;
  }

  /**
   * Get all registered event names
   *
   * @returns Array of event names
   */
  eventNames(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Remove all listeners
   *
   * @param event - Optional event name to clear (clears all if not provided)
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.subscriptions.delete(event);
    } else {
      this.subscriptions.clear();
    }
  }

  /**
   * Handle errors from event handlers
   */
  private handleError(error: unknown, event: string, data: unknown): void {
    // In production, this would log to error tracking service
    if (__DEV__) {
      debug.error(`Error in event handler for "${event}":`, error as Error);
      debug.debug('Event data:', data);
    }

    // Emit error event for error tracking
    this.emit('error:handler', {
      originalEvent: event,
      error,
      data,
      timestamp: Date.now(),
    });
  }
}

/**
 * Global event emitter singleton
 */
export const globalEventEmitter = EventEmitter.getInstance();

/**
 * Create a namespaced event emitter
 */
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
