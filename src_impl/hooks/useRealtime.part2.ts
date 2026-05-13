import { useEffect, useRef, useCallback, useState } from "react";
import { initializePresence, updatePresence, subscribeToSquadPresence, subscribeToActivity, subscribeToFeedChanges, subscribeToSquadChanges, subscribeToGuildQuests, broadcastActivity, type PresenceStatus, type UserPresence, type SquadPresence, type BroadcastMessage } from "../services/realtime";
import { eventBus } from "../events";
import { createDebugger } from "../utils/debug";


export function useOnlineUsers() {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsubscribe = eventBus.subscribe('realtime:presence_update', (event) => {
      if (event.status === 'online' || event.status === 'in_session') {
        setOnlineUsers((prev) => new Set([...prev, event.userId]));
      } else {
        setOnlineUsers((prev) => {
          const next = new Set(prev);
          next.delete(event.userId);
          return next;
        });
      }
    });

    return unsubscribe;
  }, []);

  return {
    onlineUsers,
    onlineCount: onlineUsers.size,
    isOnline: useCallback((userId: string) => onlineUsers.has(userId), [onlineUsers]),
  };
}