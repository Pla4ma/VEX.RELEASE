import { useCallback, useEffect, useState } from 'react';
import { loadCompanionState } from '../../../features/companion/session-storage';
import type { CompanionState } from '../../../features/companion/types';

export type HomeCompanionStatus =
  | { kind: 'loading' }
  | { kind: 'empty' }
  | { kind: 'error'; error: Error }
  | { kind: 'offline' }
  | { kind: 'success'; state: CompanionState };

export function useHomeCompanion(userId: string | undefined, isOnline: boolean): HomeCompanionStatus {
  const [status, setStatus] = useState<HomeCompanionStatus>({ kind: 'loading' });

  const load = useCallback(async () => {
    if (!userId) {
      setStatus({ kind: 'empty' });
      return;
    }
    if (!isOnline) {
      setStatus({ kind: 'offline' });
      return;
    }
    setStatus({ kind: 'loading' });
    try {
      const state = await loadCompanionState(userId);
      setStatus({ kind: 'success', state });
    } catch (caught: unknown) {
      setStatus({
        kind: 'error',
        error: caught instanceof Error ? caught : new Error(String(caught)),
      });
    }
  }, [userId, isOnline]);

  useEffect(() => {
    load();
  }, [load]);

  return status;
}
