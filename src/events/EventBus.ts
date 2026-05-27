import {
  EventEmitter,
  globalEventEmitter,
  type EventHandler,
} from "./EventEmitter";
import type { EventChannels } from "./EventTypes";
import { createDebugger } from "../utils/debug";
const debug = createDebugger("events:bus");
const isDevRuntime = typeof __DEV__ !== "undefined" && __DEV__;
interface EventBusOptions {
  debug?: boolean;
  maxListeners?: number;
  enableHistory?: boolean;
  historySize?: number;
}
const DEFAULT_OPTIONS: EventBusOptions = {
  debug: isDevRuntime,
  maxListeners: 100,
  enableHistory: isDevRuntime,
  historySize: 100,
};
export class EventBus {
  private emitter: EventEmitter;
  private options: EventBusOptions;
  private history: Array<{ event: string; data: unknown; timestamp: number }> =
    [];
  private static instance: EventBus | null = null;
  constructor(options: EventBusOptions = {}) {
    this.emitter = globalEventEmitter;
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }
  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }
  subscribe<T extends keyof EventChannels>(
    channel: T,
    handler: EventHandler<EventChannels[T]>,
    options: { once?: boolean; priority?: number } = {},
  ): () => void {
    if (this.options.debug) {
      this.log("subscribe", channel as string);
    }
    return this.emitter.on(channel as string, handler, options);
  }
  subscribeOnce<T extends keyof EventChannels>(
    channel: T,
    handler: EventHandler<EventChannels[T]>,
  ): () => void {
    return this.emitter.once(channel as string, handler);
  }
  unsubscribe<T extends keyof EventChannels>(
    channel: T,
    handler?: EventHandler<EventChannels[T]>,
  ): void {
    this.emitter.off(channel as string, handler);
  }
  publish<T extends keyof EventChannels>(
    channel: T,
    data: EventChannels[T],
  ): void {
    if (this.options.debug) {
      this.log("publish", channel as string, data);
    }
    if (this.options.enableHistory) {
      this.addToHistory(channel as string, data);
    }
    this.emitter.emit(channel as string, data);
  }
  emit<T extends keyof EventChannels>(
    channel: T,
    data: EventChannels[T],
  ): void {
    this.publish(channel, data);
  }
  private publishUntyped(channel: string, data: unknown): void {
    if (this.options.debug) {
      this.log("emit", channel, data);
    }
    if (this.options.enableHistory) {
      this.addToHistory(channel, data);
    }
    this.emitter.emit(channel, data);
  }
  async publishAsync<T extends keyof EventChannels>(
    channel: T,
    data: EventChannels[T],
  ): Promise<void> {
    if (this.options.debug) {
      this.log("publishAsync", channel as string, data);
    }
    if (this.options.enableHistory) {
      this.addToHistory(channel as string, data);
    }
    await this.emitter.emitAsync(channel as string, data);
  }
  waitFor<T extends keyof EventChannels>(
    channel: T,
    timeout?: number,
  ): Promise<EventChannels[T]> {
    return new Promise((resolve, reject) => {
      const unsubscribe = this.subscribeOnce(
        channel,
        resolve as EventHandler<EventChannels[T]>,
      );
      if (timeout) {
        setTimeout(() => {
          unsubscribe();
          reject(new Error(`Timeout waiting for event: ${channel}`));
        }, timeout);
      }
    });
  }
  hasSubscribers<T extends keyof EventChannels>(channel: T): boolean {
    return this.emitter.hasListeners(channel as string);
  }
  subscriberCount<T extends keyof EventChannels>(channel: T): number {
    return this.emitter.listenerCount(channel as string);
  }
  getActiveChannels(): string[] {
    return this.emitter.eventNames();
  }
  clear(): void {
    this.emitter.removeAllListeners();
    this.history = [];
  }
  getHistory(): Array<{ event: string; data: unknown; timestamp: number }> {
    return [...this.history];
  }
  clearHistory(): void {
    this.history = [];
  }
  private addToHistory(event: string, data: unknown): void {
    this.history.push({ event, data, timestamp: Date.now() });
    if (this.history.length > (this.options.historySize ?? 100)) {
      this.history.shift();
    }
  }
  private log(operation: string, channel: string, data?: unknown): void {
    const dataStr =
      data !== undefined ? JSON.stringify(data).slice(0, 100) : "";
    debug.debug(`[EventBus] ${operation}: ${channel} ${dataStr}`);
  }
}
export const eventBus = EventBus.getInstance();
