import { useEffect, useRef } from 'react';
import { subscribeToGuildQuests } from '../services/realtime';

interface UseGuildQuestsOptions {
  guildId: string | undefined;
  onQuestUpdate?: (payload: unknown) => void;
}

export function useGuildQuests({
  guildId,
  onQuestUpdate,
}: UseGuildQuestsOptions) {
  const onQuestUpdateRef = useRef(onQuestUpdate);
  useEffect(() => { onQuestUpdateRef.current = onQuestUpdate; }, [onQuestUpdate]);

  useEffect(() => {
    if (!guildId) {return;}
    let unsub: (() => void) | null = null;
    let cancelled = false;
    subscribeToGuildQuests(guildId, (payload) => {
      if (cancelled) {return;}
      onQuestUpdateRef.current?.(payload);
    }).then((u) => {
      if (cancelled) { u(); return; }
      unsub = u;
    });
    return () => { cancelled = true; unsub?.(); };
  }, [guildId]);
}
