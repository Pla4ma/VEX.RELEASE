/**
 * Event bus safety contract.
 *
 * CORE RULES:
 * 1. Core state changes (session, XP, streak, progress) MUST be explicit —
 *    never depend on event bus for these.
 * 2. Secondary effects (analytics, notifications, story generation, companion
 *    reactions, achievements, feed updates) CAN use events.
 * 3. Every subscriber MUST return its unsubscribe function.
 * 4. Every service that subscribes MUST expose a destroy()/cleanup() method.
 * 5. Every critical channel handler MUST be idempotent.
 *
 * SESSION COMPLETION — THE EXPLICIT PATH:
 *
 *   Session completes
 *     ├── Explicit (no events):
 *     │   ├── createCompletionLedger()
 *     │   ├── updateSessionStatus()
 *     │   ├── grantXP()
 *     │   ├── updateStreak()
 *     │   └── updateProgress()
 *     └── Events (optional/secondary):
 *         ├── session:completed → analytics, story, companion
 *         ├── session:rewards:granted → feed update
 *         └── progression:level_up → achievement check, notification
 *
 * NEVER:
 * - Grant XP from an event handler (that's the explicit path's job)
 * - Update streak from an event handler
 * - Create ledger entries from an event handler
 * - Subscribe without cleanup in the same scope
 * - Use event order for correctness guarantees
 */
import type { EventChannels } from './EventTypes';
import { eventBus } from './EventBus';

const processedKeys = new Map<string, Set<string>>();

/**
 * Subscribe to a critical channel with idempotency protection.
 * The handler is only called once per unique idempotencyKey.
 */
export function subscribeIdempotent<T extends keyof EventChannels>(
  channel: T,
  handler: (data: EventChannels[T]) => void | Promise<void>,
  getKey: (data: EventChannels[T]) => string,
  options: { ttlMs?: number } = {},
): () => void {
  const channelKeys = processedKeys.get(channel as string) ?? new Set<string>();
  processedKeys.set(channel as string, channelKeys);

  const wrappedHandler = (data: EventChannels[T]): void => {
    const key = getKey(data);
    if (channelKeys.has(key)) {return;}
    channelKeys.add(key);
    if (options.ttlMs) {
      setTimeout(() => channelKeys.delete(key), options.ttlMs);
    }
    handler(data);
  };

  return eventBus.subscribe(channel, wrappedHandler);
}

/**
 * Clear processed keys for a channel (e.g. on logout).
 */
export function resetIdempotency(channel?: string): void {
  if (channel) {
    processedKeys.delete(channel);
  } else {
    processedKeys.clear();
  }
}
