import { useEffect, useRef } from 'react';
import type { ContentStudyEventMap } from './types';
import { captureException } from '../../config/sentry';
import { contentStudyEvents } from './emitters';

export function useContentStudyEvent<K extends keyof ContentStudyEventMap>(
  event: K,
  callback: (data: ContentStudyEventMap[K]) => void,
): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  useEffect(() => {
    const unsubscribe = contentStudyEvents.subscribe(event, (data) => {
      callbackRef.current(data);
    });
    return unsubscribe;
  }, [event]);
}

export function useContentStudyEvents(
  events: Array<{
    event: keyof ContentStudyEventMap;
    callback: (data: unknown) => void;
  }>,
): void {
  useEffect(() => {
    const unsubscribes = events.map(({ event, callback }) =>
      contentStudyEvents.subscribe(event, callback),
    );
    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [events]);
}

export function composeEventHandlers<T>(
  ...handlers: Array<(data: T) => void | Promise<void>>
): (data: T) => void {
  return (data: T) => {
    handlers.forEach((handler) => {
      try {
        const result = handler(data);
        if (result instanceof Promise) {
          result.catch((error: unknown) => {
            captureException(
              error instanceof Error
                ? error
                : new Error('Async event handler error'),
              { area: 'content-study.events.compose' },
            );
          });
        }
      } catch (e) {
        captureException(
          e instanceof Error ? e : new Error('Event handler error'),
          { area: 'content-study.events.compose' },
        );
      }
    });
  };
}

export function initializeContentStudyEventIntegration(appEventBus?: {
  subscribe: (event: string, callback: (data: unknown) => void) => () => void;
  emit: (event: string, data: unknown) => void;
}): void {
  if (!appEventBus) {
    return;
  }
  const eventsToForward: Array<keyof ContentStudyEventMap> = [
    'content-study:session-started',
    'content-study:session-ended',
    'content-study:content-deleted',
  ];
  eventsToForward.forEach((event) => {
    contentStudyEvents.subscribe(event, (data) => {
      appEventBus.emit(event as string, data);
    });
  });
}
