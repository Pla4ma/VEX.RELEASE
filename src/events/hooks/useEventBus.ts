/**
 * useEventBus Hook
 *
 * React hook for accessing the event bus.
 */

import { useCallback, useRef, useEffect } from 'react';
import { eventBus } from '../EventBus';
import type { EventChannels } from '../EventTypes';

/**
 * Hook to access the event bus instance
 */
export function useEventBus() {
  return eventBus;
}

/**
 * Hook to subscribe to an event channel
 */
export function useEventSubscription<T extends keyof EventChannels>(
  channel: T,
  handler: (data: EventChannels[T]) => void,
) {
  const handlerRef = useRef(handler);

  // Update handler ref when handler changes
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const unsubscribe = eventBus.subscribe(channel, (data) =>
      handlerRef.current(data as EventChannels[T]),
    );

    return unsubscribe;
  }, [channel]);
}

/**
 * Hook to create an event publisher
 */
export function useEventPublisher<T extends keyof EventChannels>(channel: T) {
  return useCallback(
    (data: EventChannels[T]) => {
      eventBus.publish(channel, data);
    },
    [channel],
  );
}
