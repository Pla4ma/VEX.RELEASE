import { useState, useEffect, useCallback, useRef } from 'react';
import { getSessionOrchestrator } from '../SessionOrchestrator';
import { eventBus } from '../../events/EventBus';
import type { SessionHistoryEntry } from '../types';

export function useSessionHistory(userId: string, limit: number = 50) {
  const orchestratorRef = useRef(getSessionOrchestrator());
  const orchestrator = orchestratorRef.current;
  const [history, setHistory] = useState<SessionHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      orchestrator.setUserId(userId);
      const entries = await orchestrator.getSessionHistory(limit);
      setHistory(entries);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [orchestrator, userId, limit]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    const unsubscribe = eventBus.subscribe('session:completed', () => {
      loadHistory();
    });
    return () => unsubscribe();
  }, [loadHistory]);

  return { history, isLoading, error, refresh: loadHistory };
}
