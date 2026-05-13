/**
 * Event Emitter
 *
 * Core event emitter implementation for the VEX application.
 * Provides pub/sub pattern for cross-component communication.
 */

import { createDebugger } from '../utils/debug';

const debug = createDebugger('events');

/**
 * Event subscription
 */
interface EventSubscription<T = unknown> {
  event: string;
  handler: EventHandler<T>;
  once: boolean;
  priority: number;
}

export * from "./EventEmitter.types";
export * from "./EventEmitter.types";
export * from "./EventEmitter.part1";
export * from "./EventEmitter.part2";
