/**
 * Base Event Types
 *
 * Core event infrastructure types used across all domains.
 */

export type EventPriority = 'low' | 'normal' | 'high' | 'critical';

export interface EventSubscriptionOptions {
  priority?: EventPriority;
  once?: boolean;
  debounce?: number;
  throttle?: number;
}

export interface EventHandlerMetadata {
  channel: string;
  handler: (data: unknown) => void;
  options: EventSubscriptionOptions;
  subscribedAt: number;
}

export interface GenericEvent {
  type: string;
  data: unknown;
  timestamp: number;
  source?: string;
}
