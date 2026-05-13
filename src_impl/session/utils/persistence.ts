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

// ============================================================================
// Recovery Tracking
// ============================================================================

interface RecoveryAttempt {
  timestamp: number;
  reason: string;
  success: boolean;
}

// ============================================================================
// Error Handling
// ============================================================================
// ============================================================================
// Utilities
// ============================================================================
// ============================================================================
// Exports
// ============================================================================
export default SessionPersistence;

export * from "./persistence.types";
export * from "./persistence.types";
export * from "./persistence.part1";
export * from "./persistence.part2";
