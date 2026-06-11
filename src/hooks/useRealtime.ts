import { useEffect, useCallback, useState } from 'react';
import {
  cleanupPresence,
  initializePresence,
  updatePresence,
  subscribeToSquadPresence,
  type PresenceStatus,
  type SquadPresence,
  getCurrentUserId,
  activeChannels,
} from '../services/realtime';
import { createDebugger } from '../utils/debug';

export { useActivityBroadcast } from './useActivityBroadcast';
export { useFeedUpdates } from './useFeedUpdates';
export { useSquadChanges } from './useSquadChanges';
export { useGuildQuests } from './useGuildQuests';

const debug = createDebugger('hooks:realtime');

interface UsePresenceOptions {
  userId: string;
  initialStatus?: PresenceStatus;
  onStatusChange?: (status: PresenceStatus) => void;
}

export function usePresence({
  userId,
  initialStatus = 'online',
  onStatusChange,
}: UsePresenceOptions) {
  const [status, setStatus] = useState<PresenceStatus>(initialStatus);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        await initializePresence(userId);
        if (mounted) {
          setIsConnected(true);
          await updatePresence(initialStatus);
        }
      } catch (error) {
        debug.error(
          'Failed to initialize presence',
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    };
    init();
    return () => {
      mounted = false;
      const userId = getCurrentUserId();
      const key = `presence:${userId}`;
      const channel = activeChannels.get(key);
      if (channel) {
        channel.unsubscribe().then(() => {
          if (!mounted) {activeChannels.delete(key);}
        });
      }
    };
  }, [userId, initialStatus]);

  const setPresenceStatus = useCallback(
    async (newStatus: PresenceStatus, metadata?: Record<string, unknown>) => {
      setStatus(newStatus);
      await updatePresence(newStatus, metadata);
      onStatusChange?.(newStatus);
    },
    [onStatusChange],
  );

  return { status, isConnected, setPresenceStatus };
}

interface UseSquadPresenceOptions {
  squadId: string | undefined;
}

export function useSquadPresence({ squadId }: UseSquadPresenceOptions) {
  const [presence, setPresence] = useState<SquadPresence | null>(null);

  useEffect(() => {
    if (!squadId) {return;}
    let cancelled = false;
    let unsubscribeRef: (() => void) | null = null;
    subscribeToSquadPresence(squadId, (data) => {
      if (!cancelled) {setPresence(data);}
    }).then((unsub) => {
      if (cancelled) { unsub(); return; }
      unsubscribeRef = unsub;
    });
    return () => {
      cancelled = true;
      unsubscribeRef?.();
      unsubscribeRef = null;
    };
  }, [squadId]);

  return {
    presence,
    activeCount: presence?.activeCount ?? 0,
    inSessionCount: presence?.inSessionCount ?? 0,
    members: presence?.members ?? new Map(),
  };
}
