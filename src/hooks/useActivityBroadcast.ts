import { useEffect, useRef } from 'react';
import { subscribeToActivity } from '../services/realtime';
import type { BroadcastMessage } from '../services/realtime';

interface UseActivityBroadcastOptions {
  channelName: string;
  onMessage?: (message: BroadcastMessage) => void;
}

export function useActivityBroadcast({
  channelName,
  onMessage,
}: UseActivityBroadcastOptions) {
  const onMessageRef = useRef(onMessage);
  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);

  useEffect(() => {
    if (!channelName) return;
    let unsub: (() => void) | null = null;
    let cancelled = false;
    subscribeToActivity(channelName, (message) => {
      if (cancelled) return;
      onMessageRef.current?.(message);
    }).then((u) => {
      if (cancelled) { u(); return; }
      unsub = u;
    });
    return () => { cancelled = true; unsub?.(); };
  }, [channelName]);
}
