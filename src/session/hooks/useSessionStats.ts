import { useState, useEffect, useCallback, useRef } from "react";
import { getSessionService } from "../SessionService";
import { eventBus } from "../../events";
import { createDebugger } from "../../utils/debug";

const debug = createDebugger("session");

export function useSessionStats(userId: string) {
  const serviceRef = useRef(getSessionService());
  const service = serviceRef.current;
  const [stats, setStats] = useState<{
    totalSessions: number;
    completedSessions: number;
    abandonedSessions: number;
    totalFocusTime: number;
    averageSessionDuration: number;
    currentStreak: number;
    longestStreak: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    try {
      service.setUserId(userId);
      const sessionStats = await service.getSessionStats();
      setStats(sessionStats);
    } catch (err) {
      debug.error("Failed to load session stats:", err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [service, userId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    const unsubscribe = eventBus.subscribe("session:completed", () => {
      loadStats();
    });
    return () => unsubscribe();
  }, [loadStats]);

  return { stats, isLoading, refresh: loadStats };
}
