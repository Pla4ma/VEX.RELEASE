import { useEffect, useRef } from 'react';
import { subscribeToSquadChanges } from '../services/realtime';

interface UseSquadChangesOptions {
  squadId: string | undefined;
  onChange?: (payload: unknown) => void;
}

export function useSquadChanges({ squadId, onChange }: UseSquadChangesOptions) {
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  useEffect(() => {
    if (!squadId) return;
    let unsub: (() => void) | null = null;
    let cancelled = false;
    subscribeToSquadChanges(squadId, (payload) => {
      if (cancelled) return;
      onChangeRef.current?.(payload);
    }).then((u) => {
      if (cancelled) { u(); return; }
      unsub = u;
    });
    return () => { cancelled = true; unsub?.(); };
  }, [squadId]);
}
