import { captureSilentFailure } from '../../utils/silent-failure';
/**
 * Session Persistence Utilities
 *
 * Handles saving and recovering session state from MMKV.
 * Critical for handling app kills, crashes, and background states.
 *
 * @phase 1 - Deepening: Persistence layer
 */

import { MMKV } from 'react-native-mmkv';
import { z } from 'zod';
import { createDebugger } from '../../utils/debug';
import { eventBus } from '../../events';

const debug = createDebugger('session:persistence');

// ============================================================================
// Storage Instance
// ============================================================================

const storage = new MMKV({
  id: 'session-persistence',
  encryptionKey: 'session-secure-storage-key',
});

// ============================================================================
// Persistence Schemas
// ============================================================================

const PersistedSessionStateSchema = z.object({
  sessionId: z.string().uuid(),
  userId: z.string(),
  status: z.enum(['ACTIVE', 'PAUSED', 'BACKGROUNDED', 'INTERRUPTION_RISK']),
  phase: z.enum(['FOCUS', 'SHORT_BREAK', 'LONG_BREAK', 'PREPARATION', 'REVIEW']),

  // Timing
  startedAt: z.number(),
  lastUpdatedAt: z.number(),
  elapsedTime: z.number().min(0),
  remainingTime: z.number().min(0),
  pausedTime: z.number().min(0).default(0),

  // Progress
  progress: z.number().min(0).max(100),
  currentInterval: z.number().int().min(1),
  totalIntervals: z.number().int().min(1),

  // Quality metrics
  interruptions: z.number().int().min(0).default(0),
  pauses: z.number().int().min(0).default(0),
  backgroundTime: z.number().min(0).default(0),

  // Config reference
  configId: z.string().uuid(),

  // Device info for conflict detection
  deviceId: z.string(),
  deviceName: z.string().optional(),

  // Version for migration
  version: z.number().default(1),
});

export type PersistedSessionState = z.infer<typeof PersistedSessionStateSchema>;

// ============================================================================
// Keys
// ============================================================================

const KEYS = {
  ACTIVE_SESSION: 'session:active',
  SESSION_HISTORY: 'session:history',
  LAST_SYNC: 'session:lastSync',
  RECOVERY_ATTEMPTS: 'session:recoveryAttempts',
  BACKUP_PREFIX: 'session:backup:',
} as const;

// ============================================================================
// Core Persistence Functions
// ============================================================================

/**
 * Save current session state to persistent storage
 */
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

/**
 * Load persisted session state
 */
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

/**
 * Clear persisted session (call on completion/abandon)
 */
export function clearPersistedSession(): void {
  storage.delete(KEYS.ACTIVE_SESSION);
  storage.delete(KEYS.RECOVERY_ATTEMPTS);

  debug.info('Persisted session cleared');
}

/**
 * Check if there's a persisted session that needs recovery
 */
export function hasPersistedSession(): boolean {
  return storage.contains(KEYS.ACTIVE_SESSION);
}

/**
 * Get time since last persistence
 */
export function getTimeSinceLastPersist(): number {
  const lastSync = storage.getNumber(KEYS.LAST_SYNC);
  if (!lastSync) {return Infinity;}
  return Date.now() - lastSync;
}

// ============================================================================
// Backup & Recovery
// ============================================================================

function cleanupOldBackups(): void {
  const allKeys = storage.getAllKeys();
  const backupKeys = allKeys
    .filter(key => key.startsWith(KEYS.BACKUP_PREFIX))
    .sort()
    .reverse();

  // Keep only last 10 backups
  const keysToDelete = backupKeys.slice(10);
  keysToDelete.forEach(key => storage.delete(key));
}

function recoverFromBackup(): PersistedSessionState | null {
  const allKeys = storage.getAllKeys();
  const backupKeys = allKeys
    .filter(key => key.startsWith(KEYS.BACKUP_PREFIX))
    .sort()
    .reverse();

  for (const key of backupKeys) {
    try {
      const data = storage.getString(key);
      if (data) {
        const parsed = JSON.parse(data);
        const validated = PersistedSessionStateSchema.parse(parsed);

        debug.info('Session recovered from backup', { sessionId: validated.sessionId });

        eventBus.publish('analytics:track', {
          event: 'session_recovered_from_backup',
          properties: {
            sessionId: validated.sessionId,
            backupAge: Date.now() - parseInt(key.split(':').pop() || '0'),
          },
        });

        return validated;
      }
    } catch (error) { captureSilentFailure(error, { feature: 'session', operation: 'safe-fallback', type: 'data' });
      // Try next backup
      continue;
    }
  }

  return null;
}

// ============================================================================
// Migration
// ============================================================================

const MIGRATIONS: Record<number, (state: Record<string, unknown>) => Record<string, unknown>> = {
  1: (state) => ({
    ...state,
    version: 2,
    pauses: state.pauses || 0,
  }),
  2: (state) => ({
    ...state,
    version: 3,
    deviceId: state.deviceId || generateDeviceId(),
  }),
};

function migrateState(state: Record<string, unknown>): Record<string, unknown> {
  let currentVersion = (state.version as number) || 1;
  let migratedState = { ...state };

  while (currentVersion < 3) {
    const migration = MIGRATIONS[currentVersion];
    if (migration) {
      migratedState = migration(migratedState);
      currentVersion = migratedState.version as number;
    } else {
      break;
    }
  }

  return migratedState;
}

function generateDeviceId(): string {
  return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// Session History (for analytics and recovery)
// ============================================================================

interface SessionHistoryEntry {
  sessionId: string;
  startedAt: number;
  endedAt: number;
  status: 'COMPLETED' | 'ABANDONED' | 'FAILED' | 'RECOVERED';
  progress: number;
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

// ============================================================================
// Recovery Tracking
// ============================================================================

interface RecoveryAttempt {
  timestamp: number;
  reason: string;
  success: boolean;
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

// ============================================================================
// Error Handling
// ============================================================================

export class SessionPersistenceError extends Error {
  constructor(
    message: string,
    public details?: { cause?: unknown; sessionId?: string }
  ) {
    super(message);
    this.name = 'SessionPersistenceError';
  }
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Calculate if session is stale (too old to recover)
 */
export function isSessionStale(persistedAt: number, maxAgeMs: number = 24 * 60 * 60 * 1000): boolean {
  return Date.now() - persistedAt > maxAgeMs;
}

/**
 * Validate if persisted session can be safely resumed
 */
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

// ============================================================================
// Exports
// ============================================================================

export const SessionPersistence = {
  persist: persistSessionState,
  load: loadPersistedSession,
  clear: clearPersistedSession,
  hasSession: hasPersistedSession,
  getTimeSinceLastPersist,
  addToHistory: addToSessionHistory,
  getHistory: getSessionHistory,
  recordRecoveryAttempt,
  getRecoveryAttempts,
  getRecoverySuccessRate,
  isSessionStale,
  canResumeSession,
};

export default SessionPersistence;
