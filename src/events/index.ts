/**
 * Event System Export
 *
 * Complete event system for the VEX application.
 */

// Core
export {
  EventEmitter,
  globalEventEmitter,
  createNamespacedEmitter,
} from './EventEmitter';
export type { EventHandler } from './EventEmitter';

// Event Bus
export { EventBus, eventBus } from './EventBus';

// Safety
export { subscribeIdempotent, resetIdempotency } from './event-safety';

// Types
export type {
  EventChannels,
  EventChannel,
  EventPayload,
  GenericEvent,
  EventPriority,
  EventSubscriptionOptions,
  EventHandlerMetadata,
} from './EventTypes';

// Hooks
export {
  useEventBus,
  useEventSubscription,
  useEventPublisher,
} from './hooks/useEventBus';
