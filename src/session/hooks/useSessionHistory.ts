import { useState, useEffect, useCallback, useRef } from 'react';
import { getSessionService } from '../SessionService';
import { eventBus } from '../../events';
import type { SessionHistoryEntry } from '../types';

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

  useEffect(() => {
    const unsubscribe = eventBus.subscribe('session:completed', () => {
      loadHistory();
    });
    return () => unsubscribe();
  }, [loadHistory]);

  return { history, isLoading, error, refresh: loadHistory };
}
