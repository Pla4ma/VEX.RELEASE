import { useState, useEffect, useCallback, useRef } from "react";
import { getSessionService } from "../SessionService";
import { eventBus } from "../../events";
import { createDebugger } from "../../utils/debug";
import type { SessionState, SessionConfig, SessionSummary, SessionHistoryEntry } from "../types";


export function useSessionHistory(userId: string, limit: number = 50) {
  const serviceRef = useRef(getSessionService());
  const service = serviceRef.current;

  const [history, setHistory] = useState<SessionHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      service.setUserId(userId);
      const entries = await service.getSessionHistory(limit);
      setHistory(entries);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [service, userId, limit]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Listen for new completed sessions
  useEffect(() => {
    const unsubscribe = eventBus.subscribe('session:completed', () => {
      loadHistory();
    });

    return () => unsubscribe();
  }, [loadHistory]);

  return {
    history,
    isLoading,
    error,
    refresh: loadHistory,
  };
}

export function useSessionPresets() {
  const serviceRef = useRef(getSessionService());
  const service = serviceRef.current;

  const [presets, setPresets] = useState(service.getAllPresets());

  const refresh = useCallback(() => {
    setPresets(service.getAllPresets());
  }, [service]);

  const createPreset = useCallback(async (config: Parameters<typeof service.createCustomPreset>[0]) => {
    const preset = await service.createCustomPreset(config);
    refresh();
    return preset;
  }, [service, refresh]);

  const deletePreset = useCallback(async (presetId: string) => {
    await service.deletePreset(presetId);
    refresh();
  }, [service, refresh]);

  return {
    presets,
    createPreset,
    deletePreset,
    refresh,
  };
}

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
      debug.error('Failed to load session stats:', err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [service, userId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Refresh on session completion
  useEffect(() => {
    const unsubscribe = eventBus.subscribe('session:completed', () => {
      loadStats();
    });

    return () => unsubscribe();
  }, [loadStats]);

  return {
    stats,
    isLoading,
    refresh: loadStats,
  };
}