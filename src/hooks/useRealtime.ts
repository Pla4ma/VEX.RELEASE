import { useEffect, useCallback, useState, useRef } from 'react';
import {
  cleanupPresence,
  initializePresence,
  updatePresence,
  subscribeToSquadPresence,
  subscribeToActivity,
  subscribeToFeedChanges,
  subscribeToSquadChanges,
  subscribeToGuildQuests,
  broadcastActivity,
  type PresenceStatus,
  type UserPresence,
  type SquadPresence,
  type BroadcastMessage,
} from '../services/realtime';
import { createDebugger } from '../utils/debug';
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
      cleanupPresence();
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
    if (!squadId) {
      return;
    }
    let cancelled = false;
    let unsubscribeRef: (() => void) | null = null;
    subscribeToSquadPresence(squadId, (data) => {
      if (!cancelled) {
        setPresence(data);
      }
    }).then((unsub) => {
      if (cancelled) {
        unsub();
        return;
      }
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
interface UseActivityBroadcastOptions {
  channelName: string;
  onMessage?: (message: BroadcastMessage) => void;
}
export function useActivityBroadcast({
  channelName,
  onMessage,
}: UseActivityBroadcastOptions) {
  const [messages, setMessages] = useState<BroadcastMessage[]>([]);
  const onMessageRef = useRef(onMessage);
  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);
  useEffect(() => {
    if (!channelName) {return;}
    let unsub: (() => void) | null = null;
    let cancelled = false;
    subscribeToActivity(channelName, (message) => {
      if (cancelled) {return;}
      setMessages((prev) => [...prev.slice(-19), message]);
      onMessageRef.current?.(message);
    }).then((u) => {
      if (cancelled) {
        u();
        return;
      }
      unsub = u;
    });
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [channelName]);
  const sendActivity = useCallback(
    async (type: BroadcastMessage['type'], payload: unknown) => {
      await broadcastActivity(channelName, type, payload);
    },
    [channelName],
  );
  const clearMessages = useCallback(() => { setMessages([]); }, []);
  return { messages, sendActivity, clearMessages };
}
interface UseFeedUpdatesOptions {
  userId: string;
  onUpdate?: (payload: unknown) => void;
}
export function useFeedUpdates({ userId, onUpdate }: UseFeedUpdatesOptions) {
  const [updates, setUpdates] = useState<unknown[]>([]);
  const onUpdateRef = useRef(onUpdate);
  useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);
  useEffect(() => {
    let unsub: (() => void) | null = null;
    let cancelled = false;
    subscribeToFeedChanges(userId, (payload) => {
      if (cancelled) {return;}
      setUpdates((prev) => [...prev.slice(-19), payload]);
      onUpdateRef.current?.(payload);
    }).then((u) => {
      if (cancelled) {
        u();
        return;
      }
      unsub = u;
    });
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [userId]);
  const clearUpdates = useCallback(() => { setUpdates([]); }, []);
  return { updates, clearUpdates };
}
interface UseSquadChangesOptions {
  squadId: string | undefined;
  onChange?: (payload: unknown) => void;
}
export function useSquadChanges({ squadId, onChange }: UseSquadChangesOptions) {
  const [changes, setChanges] = useState<unknown[]>([]);
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  useEffect(() => {
    if (!squadId) {
      return;
    }
    let unsub: (() => void) | null = null;
    let cancelled = false;
    subscribeToSquadChanges(squadId, (payload) => {
      if (cancelled) {return;}
      setChanges((prev) => [...prev.slice(-19), payload]);
      onChangeRef.current?.(payload);
    }).then((u) => {
      if (cancelled) {
        u();
        return;
      }
      unsub = u;
    });
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [squadId]);
  return { changes, changeCount: changes.length };
}
interface UseGuildQuestsOptions {
  guildId: string | undefined;
  onQuestUpdate?: (payload: unknown) => void;
}
export function useGuildQuests({
  guildId,
  onQuestUpdate,
}: UseGuildQuestsOptions) {
  const [questUpdates, setQuestUpdates] = useState<unknown[]>([]);
  const onQuestUpdateRef = useRef(onQuestUpdate);
  useEffect(() => { onQuestUpdateRef.current = onQuestUpdate; }, [onQuestUpdate]);
  useEffect(() => {
    if (!guildId) {
      return;
    }
    let unsub: (() => void) | null = null;
    let cancelled = false;
    subscribeToGuildQuests(guildId, (payload) => {
      if (cancelled) {return;}
      setQuestUpdates((prev) => [...prev.slice(-19), payload]);
      onQuestUpdateRef.current?.(payload);
    }).then((u) => {
      if (cancelled) {
        u();
        return;
      }
      unsub = u;
    });
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [guildId]);
  return { questUpdates, latestUpdate: questUpdates[questUpdates.length - 1] };
}
