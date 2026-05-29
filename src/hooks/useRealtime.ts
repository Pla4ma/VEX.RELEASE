import { useEffect, useCallback, useState } from "react";
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
} from "../services/realtime";
import { createDebugger } from "../utils/debug";
const debug = createDebugger("hooks:realtime");
interface UsePresenceOptions {
  userId: string;
  initialStatus?: PresenceStatus;
  onStatusChange?: (status: PresenceStatus) => void;
}
export function usePresence({
  userId,
  initialStatus = "online",
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
          "Failed to initialize presence",
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    };
    init();
    return () => {
      mounted = false;
      void cleanupPresence();
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
    let mounted = true;
    let unsubscribe: (() => void) | null = null;
    const subscribe = async () => {
      const nextUnsubscribe = await subscribeToSquadPresence(squadId, (data) => {
        if (mounted) {
          setPresence(data);
        }
      });
      if (!mounted) {
        nextUnsubscribe();
        return;
      }
      unsubscribe = nextUnsubscribe;
    };
    subscribe();
    return () => {
      mounted = false;
      unsubscribe?.();
      unsubscribe = null;
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
  useEffect(() => {
    if (!channelName) {
      return;
    }
    const unsubscribe = subscribeToActivity(channelName, (message) => {
      setMessages((prev) => [...prev.slice(-49), message]);
      onMessage?.(message);
    });
    return unsubscribe;
  }, [channelName, onMessage]);
  const sendActivity = useCallback(
    async (type: BroadcastMessage["type"], payload: unknown) => {
      await broadcastActivity(channelName, type, payload);
    },
    [channelName],
  );
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);
  return { messages, sendActivity, clearMessages };
}
interface UseFeedUpdatesOptions {
  userId: string;
  onUpdate?: (payload: unknown) => void;
}
export function useFeedUpdates({ userId, onUpdate }: UseFeedUpdatesOptions) {
  const [updates, setUpdates] = useState<unknown[]>([]);
  useEffect(() => {
    const unsubscribe = subscribeToFeedChanges(userId, (payload) => {
      setUpdates((prev) => [...prev.slice(-19), payload]);
      onUpdate?.(payload);
    });
    return unsubscribe;
  }, [onUpdate]);
  const clearUpdates = useCallback(() => {
    setUpdates([]);
  }, []);
  return { updates, clearUpdates };
}
interface UseSquadChangesOptions {
  squadId: string | undefined;
  onChange?: (payload: unknown) => void;
}
export function useSquadChanges({ squadId, onChange }: UseSquadChangesOptions) {
  const [changes, setChanges] = useState<unknown[]>([]);
  useEffect(() => {
    if (!squadId) {
      return;
    }
    const unsubscribe = subscribeToSquadChanges(squadId, (payload) => {
      setChanges((prev) => [...prev.slice(-19), payload]);
      onChange?.(payload);
    });
    return unsubscribe;
  }, [squadId, onChange]);
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
  useEffect(() => {
    if (!guildId) {
      return;
    }
    const unsubscribe = subscribeToGuildQuests(guildId, (payload) => {
      setQuestUpdates((prev) => [...prev.slice(-19), payload]);
      onQuestUpdate?.(payload);
    });
    return unsubscribe;
  }, [guildId, onQuestUpdate]);
  return { questUpdates, latestUpdate: questUpdates[questUpdates.length - 1] };
}
