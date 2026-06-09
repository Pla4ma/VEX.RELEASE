import { useEffect, useRef } from 'react';
import { subscribeToFeedChanges } from '../services/realtime';

interface UseFeedUpdatesOptions {
  userId: string;
  onUpdate?: (payload: unknown) => void;
}

export function useFeedUpdates({ userId, onUpdate }: UseFeedUpdatesOptions) {
  const onUpdateRef = useRef(onUpdate);
  useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    let cancelled = false;
    subscribeToFeedChanges(userId, (payload) => {
      if (cancelled) {return;}
      onUpdateRef.current?.(payload);
    }).then((u) => {
      if (cancelled) { u(); return; }
      unsub = u;
    });
    return () => { cancelled = true; unsub?.(); };
  }, [userId]);
}
