import { captureSilentFailure } from "../../utils/silent-failure";
import { MMKV } from "react-native-mmkv";
import { z } from "zod";
import { createDebugger } from "../../utils/debug";
import { eventBus } from "../../events";


export function persistSessionState(state: PersistedSessionState): void {
  try {
    const validated = PersistedSessionStateSchema.parse(state);
    const data = JSON.stringify(validated);

    storage.set(KEYS.ACTIVE_SESSION, data);
    storage.set(KEYS.LAST_SYNC, Date.now());

    // Also create a timestamped backup for recovery
    const backupKey = `${KEYS.BACKUP_PREFIX}${Date.now()}`;
    storage.set(backupKey, data);

    // Clean up old backups (keep last 10)
    cleanupOldBackups();

    debug.info('Session state persisted', { sessionId: state.sessionId });

    eventBus.publish('analytics:track', {
      event: 'session_persisted',
      properties: {
        sessionId: state.sessionId,
        status: state.status,
        progress: state.progress,
      },
    });
  } catch (error) {
    debug.error('Failed to persist session state', error instanceof Error ? error : new Error(String(error)));
    throw new SessionPersistenceError('Failed to persist session state', { cause: error });
  }
}

export function loadPersistedSession(): PersistedSessionState | null {
  try {
    const data = storage.getString(KEYS.ACTIVE_SESSION);

    if (!data) {
      debug.info('No persisted session found');
      return null;
    }

    const parsed = JSON.parse(data);
    const validated = PersistedSessionStateSchema.parse(parsed);

    debug.info('Session state loaded', { sessionId: validated.sessionId });
    return validated;
  } catch (error) {
    debug.error('Failed to load persisted session', error instanceof Error ? error : new Error(String(error)));

    // Try to recover from backup
    return recoverFromBackup();
  }
}

export function clearPersistedSession(): void {
  storage.delete(KEYS.ACTIVE_SESSION);
  storage.delete(KEYS.RECOVERY_ATTEMPTS);

  debug.info('Persisted session cleared');
}

export function hasPersistedSession(): boolean {
  return storage.contains(KEYS.ACTIVE_SESSION);
}

export function getTimeSinceLastPersist(): number {
  const lastSync = storage.getNumber(KEYS.LAST_SYNC);
  if (!lastSync) {return Infinity;}
  return Date.now() - lastSync;
}

export function addToSessionHistory(entry: SessionHistoryEntry): void {
  const history = getSessionHistory();
  history.unshift(entry);

  // Keep only last 100 entries
  const trimmed = history.slice(0, 100);

  storage.set(KEYS.SESSION_HISTORY, JSON.stringify(trimmed));
}

export function getSessionHistory(): SessionHistoryEntry[] {
  try {
    const data = storage.getString(KEYS.SESSION_HISTORY);
    if (!data) {return [];}
    return JSON.parse(data);
  } catch (error) { captureSilentFailure(error, { feature: 'session', operation: 'safe-fallback', type: 'data' });
    return [];
  }
}

export function recordRecoveryAttempt(attempt: RecoveryAttempt): void {
  const attempts = getRecoveryAttempts();
  attempts.push(attempt);

  // Keep only last 50 attempts
  storage.set(KEYS.RECOVERY_ATTEMPTS, JSON.stringify(attempts.slice(-50)));
}

export function getRecoveryAttempts(): RecoveryAttempt[] {
  try {
    const data = storage.getString(KEYS.RECOVERY_ATTEMPTS);
    if (!data) {return [];}
    return JSON.parse(data);
  } catch (error) { captureSilentFailure(error, { feature: 'session', operation: 'safe-fallback', type: 'data' });
    return [];
  }
}

export function getRecoverySuccessRate(): number {
  const attempts = getRecoveryAttempts();
  if (attempts.length === 0) {return 0;}

  const successful = attempts.filter(a => a.success).length;
  return successful / attempts.length;
}

export class SessionPersistenceError extends Error {
  constructor(
    message: string,
    public details?: { cause?: unknown; sessionId?: string }
  ) {
    super(message);
    this.name = 'SessionPersistenceError';
  }
}

export function isSessionStale(persistedAt: number, maxAgeMs: number = 24 * 60 * 60 * 1000): boolean {
  return Date.now() - persistedAt > maxAgeMs;
}

export function canResumeSession(state: PersistedSessionState): {
  canResume: boolean;
  reason?: string;
  risk: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
} {
  const age = Date.now() - state.lastUpdatedAt;

  // Check if too old
  if (age > 24 * 60 * 60 * 1000) {
    return {
      canResume: false,
      reason: 'Session is too old (over 24 hours)',
      risk: 'HIGH',
    };
  }

  // Check if already completed/abandoned
  if (!['ACTIVE', 'PAUSED', 'BACKGROUNDED'].includes(state.status)) {
    return {
      canResume: false,
      reason: `Session is in ${state.status} state`,
      risk: 'NONE',
    };
  }

  // Check for excessive interruptions
  if (state.interruptions > 10) {
    return {
      canResume: true,
      reason: `Session has ${state.interruptions} interruptions - quality may be affected`,
      risk: 'MEDIUM',
    };
  }

  // Check for long background time
  if (state.backgroundTime > 30 * 60 * 1000) {
    return {
      canResume: true,
      reason: 'Session was backgrounded for extended period',
      risk: 'MEDIUM',
    };
  }

  return { canResume: true, risk: 'NONE' };
}