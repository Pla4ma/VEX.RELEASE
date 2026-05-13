import { useEffect, useRef, useCallback, useState } from "react";
import { initializePresence, updatePresence, subscribeToSquadPresence, subscribeToActivity, subscribeToFeedChanges, subscribeToSquadChanges, subscribeToGuildQuests, broadcastActivity, type PresenceStatus, type UserPresence, type SquadPresence, type BroadcastMessage } from "../services/realtime";
import { eventBus } from "../events";
import { createDebugger } from "../utils/debug";


export function usePresence({ userId, initialStatus = 'online', onStatusChange }: UsePresenceOptions) {
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
        debug.error('Failed to initialize presence', error instanceof Error ? error : new Error(String(error)));
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [userId, initialStatus]);

  const setPresenceStatus = useCallback(async (newStatus: PresenceStatus, metadata?: Record<string, unknown>) => {
    setStatus(newStatus);
    await updatePresence(newStatus, metadata);
    onStatusChange?.(newStatus);
  }, [onStatusChange]);

  return {
    status,
    isConnected,
    setPresenceStatus,
  };
}

export function useSquadPresence({ squadId }: UseSquadPresenceOptions) {
  const [presence, setPresence] = useState<SquadPresence | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!squadId) {return;}

    let mounted = true;

    const subscribe = async () => {
      const unsubscribe = await subscribeToSquadPresence(squadId, (data) => {
        if (mounted) {
          setPresence(data);
        }
      });
      unsubscribeRef.current = unsubscribe;
    };

    subscribe();

    return () => {
      mounted = false;
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    };
  }, [squadId]);

  return {
    presence,
    activeCount: presence?.activeCount ?? 0,
    inSessionCount: presence?.inSessionCount ?? 0,
    members: presence?.members ?? new Map(),
  };
}

export function useActivityBroadcast({ channelName, onMessage }: UseActivityBroadcastOptions) {
  const [messages, setMessages] = useState<BroadcastMessage[]>([]);

  useEffect(() => {
    if (!channelName) {return;}

    const unsubscribe = subscribeToActivity(channelName, (message) => {
      setMessages((prev) => [...prev.slice(-49), message]); // Keep last 50
      onMessage?.(message);
    });

    return unsubscribe;
  }, [channelName, onMessage]);

  const sendActivity = useCallback(
    async (type: BroadcastMessage['type'], payload: unknown) => {
      await broadcastActivity(channelName, type, payload);
    },
    [channelName]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    sendActivity,
    clearMessages,
  };
}

export function useFeedUpdates({ onUpdate }: UseFeedUpdatesOptions = {}) {
  const [updates, setUpdates] = useState<unknown[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToFeedChanges((payload) => {
      setUpdates((prev) => [...prev.slice(-19), payload]); // Keep last 20
      onUpdate?.(payload);
    });

    return unsubscribe;
  }, [onUpdate]);

  const clearUpdates = useCallback(() => {
    setUpdates([]);
  }, []);

  return {
    updates,
    clearUpdates,
  };
}

export function useSquadChanges({ squadId, onChange }: UseSquadChangesOptions) {
  const [changes, setChanges] = useState<unknown[]>([]);

  useEffect(() => {
    if (!squadId) {return;}

    const unsubscribe = subscribeToSquadChanges(squadId, (payload) => {
      setChanges((prev) => [...prev.slice(-19), payload]);
      onChange?.(payload);
    });

    return unsubscribe;
  }, [squadId, onChange]);

  return {
    changes,
    changeCount: changes.length,
  };
}

export function useGuildQuests({ guildId, onQuestUpdate }: UseGuildQuestsOptions) {
  const [questUpdates, setQuestUpdates] = useState<unknown[]>([]);

  useEffect(() => {
    if (!guildId) {return;}

    const unsubscribe = subscribeToGuildQuests(guildId, (payload) => {
      setQuestUpdates((prev) => [...prev.slice(-19), payload]);
      onQuestUpdate?.(payload);
    });

    return unsubscribe;
  }, [guildId, onQuestUpdate]);

  return {
    questUpdates,
    latestUpdate: questUpdates[questUpdates.length - 1],
  };
}