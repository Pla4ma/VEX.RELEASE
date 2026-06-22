import { useEffect, useRef } from 'react';
import { eventBus } from '../events/EventBus';
import type { EventChannels } from '../events/EventTypes';
import type { EventHandler } from '../events/EventEmitter';

export function useEventBus<T extends keyof EventChannels>(
  channel: T,
  handler: EventHandler<EventChannels[T]>,
  options: { once?: boolean; priority?: number } = {},
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const unsubscribe = eventBus.subscribe(channel, ((data: EventChannels[T]) => {
      handlerRef.current(data);
    }) as EventHandler<EventChannels[T]>, optionsRef.current);

    return () => {
      unsubscribe();
    };
  }, [channel]);
}
