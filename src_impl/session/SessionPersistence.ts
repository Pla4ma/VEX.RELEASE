import {
  clearPersistedSession,
  loadPersistedSession,
  persistSessionState,
} from './utils/persistence';
import type { SessionState, SessionSummary } from './types';

export * from './utils/persistence';

export async function saveSessionState(session: SessionState): Promise<void> {
  persistSessionState(session);
}

export async function loadActiveSession(): Promise<SessionState | null> {
  return loadPersistedSession() as SessionState | null;
}

export function restoreTimerEngine(): null {
  return null;
}

export async function finalizeSession(
  _session: SessionState,
  _summary: SessionSummary,
  _repository: unknown,
): Promise<void> {
  clearPersistedSession();
}

export async function finalizeAbandonedSession(
  _session: SessionState,
  _repository: unknown,
): Promise<void> {
  clearPersistedSession();
}
