/**
 * Event Bus
 *
 * Central event bus for cross-system communication.
 * Provides typed events and channel-based messaging.
 */

import { EventEmitter, globalEventEmitter, type EventHandler } from './EventEmitter';
import type { EventChannels } from './EventTypes';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('events:bus');

/**
 * Event bus options
 */
interface EventBusOptions {
  debug?: boolean;
  maxListeners?: number;
  enableHistory?: boolean;
  historySize?: number;
}

/**
 * Event bus configuration
 */
const DEFAULT_OPTIONS: EventBusOptions = {
  debug: __DEV__,
  maxListeners: 100,
  enableHistory: __DEV__,
  historySize: 100,
};

/**
 * Event Bus class
 *
 * Central hub for application-wide event communication.
 */
export class EventBus {
  private emitter: EventEmitter;
  private options: EventBusOptions;
  private history: Array<{ event: string; data: unknown; timestamp: number }> = [];
  private static instance: EventBus | null = null;

  constructor(options: EventBusOptions = {}) {
    this.emitter = globalEventEmitter;
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Get singleton instance
   */
  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Subscribe to a channel
   */
  subscribe<T extends keyof EventChannels>(
    channel: T,
    handler: EventHandler<EventChannels[T]>,
    options: { once?: boolean; priority?: number } = {}
  ): () => void {
    if (this.options.debug) {
      this.log('subscribe', channel);
    }

    return this.emitter.on(channel, handler, options);
  }

  /**
   * Subscribe once to a channel
   */
  subscribeOnce<T extends keyof EventChannels>(
    channel: T,
    handler: EventHandler<EventChannels[T]>
  ): () => void {
    return this.emitter.once(channel, handler);
  }

  /**
   * Unsubscribe from a channel
   */
  unsubscribe<T extends keyof EventChannels>(
    channel: T,
    handler?: EventHandler<EventChannels[T]>
  ): void {
    this.emitter.off(channel, handler);
  }

  /**
   * Publish to a channel
   */
  publish<T extends keyof EventChannels>(
    channel: T,
    data: EventChannels[T]
  ): void {
    if (this.options.debug) {
      this.log('publish', channel, data);
    }

    // Add to history
    if (this.options.enableHistory) {
      this.addToHistory(channel, data);
    }

    this.emitter.emit(channel, data);
  }

  /**
   * Publish asynchronously
   */
  async publishAsync<T extends keyof EventChannels>(
    channel: T,
    data: EventChannels[T]
  ): Promise<void> {
    if (this.options.debug) {
      this.log('publishAsync', channel, data);
    }

    if (this.options.enableHistory) {
      this.addToHistory(channel, data);
    }

    await this.emitter.emitAsync(channel, data);
  }

  /**
   * Wait for an event
   */
  waitFor<T extends keyof EventChannels>(
    channel: T,
    timeout?: number
  ): Promise<EventChannels[T]> {
    return new Promise((resolve, reject) => {
      const unsubscribe = this.subscribeOnce(channel, resolve as EventHandler<EventChannels[T]>);

      if (timeout) {
        setTimeout(() => {
          unsubscribe();
          reject(new Error(`Timeout waiting for event: ${channel}`));
        }, timeout);
      }
    });
  }

  /**
   * Check if channel has subscribers
   */
  hasSubscribers<T extends keyof EventChannels>(channel: T): boolean {
    return this.emitter.hasListeners(channel);
  }

  /**
   * Get subscriber count for channel
   */
  subscriberCount<T extends keyof EventChannels>(channel: T): number {
    return this.emitter.listenerCount(channel);
  }

  /**
   * Get all active channels
   */
  getActiveChannels(): string[] {
    return this.emitter.eventNames();
  }

  /**
   * Clear all subscribers
   */
  clear(): void {
    this.emitter.removeAllListeners();
    this.history = [];
  }

  /**
   * Get event history
   */
  getHistory(): Array<{ event: string; data: unknown; timestamp: number }> {
    return [...this.history];
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * Add event to history
   */
  private addToHistory(event: string, data: unknown): void {
    this.history.push({
      event,
      data,
      timestamp: Date.now(),
    });

    // Limit history size
    if (this.history.length > (this.options.historySize ?? 100)) {
      this.history.shift();
    }
  }

  /**
   * Log event operations
   */
  private log(operation: string, channel: string, data?: unknown): void {
    const dataStr = data !== undefined ? JSON.stringify(data).slice(0, 100) : '';
    debug.debug(`[EventBus] ${operation}: ${channel} ${dataStr}`);
  }
}

/**
 * Global event bus instance
 */
export const eventBus = EventBus.getInstance();
