import { captureSilentFailure } from "../../utils/silent-failure";
import { MMKV } from "react-native-mmkv";
import { z } from "zod";
import { createDebugger } from "../../utils/debug";
import { eventBus } from "../../events";
const debug = createDebugger("session:persistence");
const storage = new MMKV({
  id: "session-persistence",
  encryptionKey: "session-secure-storage-key",
});
const PersistedSessionStateSchema = z.object({
  sessionId: z.string().uuid(),
  userId: z.string(),
  status: z.enum(["ACTIVE", "PAUSED", "BACKGROUNDED", "INTERRUPTION_RISK"]),
  phase: z.enum([
    "FOCUS",
    "SHORT_BREAK",
    "LONG_BREAK",
    "PREPARATION",
    "REVIEW",
  ]),
  startedAt: z.number(),
  lastUpdatedAt: z.number(),
  elapsedTime: z.number().min(0),
  remainingTime: z.number().min(0),
  pausedTime: z.number().min(0).default(0),
  progress: z.number().min(0).max(100),
  currentInterval: z.number().int().min(1),
  totalIntervals: z.number().int().min(1),
  interruptions: z.number().int().min(0).default(0),
  pauses: z.number().int().min(0).default(0),
  backgroundTime: z.number().min(0).default(0),
  configId: z.string().uuid(),
  deviceId: z.string(),
  deviceName: z.string().optional(),
  version: z.number().default(1),
});
export type PersistedSessionState = z.infer<typeof PersistedSessionStateSchema>;
const KEYS = {
  ACTIVE_SESSION: "session:active",
  SESSION_HISTORY: "session:history",
  LAST_SYNC: "session:lastSync",
  RECOVERY_ATTEMPTS: "session:recoveryAttempts",
  BACKUP_PREFIX: "session:backup:",
} as const;
export function persistSessionState(state: PersistedSessionState): void {
  try {
    const validated = PersistedSessionStateSchema.parse(state);
    const data = JSON.stringify(validated);
    storage.set(KEYS.ACTIVE_SESSION, data);
    storage.set(KEYS.LAST_SYNC, Date.now());
    const backupKey = `${KEYS.BACKUP_PREFIX}${Date.now()}`;
    storage.set(backupKey, data);
    cleanupOldBackups();
    debug.info("Session state persisted", { sessionId: state.sessionId });
    eventBus.publish("analytics:track", {
      event: "session_persisted",
      properties: {
        sessionId: state.sessionId,
        status: state.status,
        progress: state.progress,
      },
    });
  } catch (error) {
    debug.error(
      "Failed to persist session state",
      error instanceof Error ? error : new Error(String(error)),
    );
    throw new SessionPersistenceError("Failed to persist session state", {
      cause: error,
    });
  }
}
export function loadPersistedSession(): PersistedSessionState | null {
  try {
    const data = storage.getString(KEYS.ACTIVE_SESSION);
    if (!data) {
      debug.info("No persisted session found");
      return null;
    }
    const parsed = JSON.parse(data);
    const validated = PersistedSessionStateSchema.parse(parsed);
    debug.info("Session state loaded", { sessionId: validated.sessionId });
    return validated;
  } catch (error) {
    debug.error(
      "Failed to load persisted session",
      error instanceof Error ? error : new Error(String(error)),
    );
    return recoverFromBackup();
  }
}
export function clearPersistedSession(): void {
  storage.delete(KEYS.ACTIVE_SESSION);
  storage.delete(KEYS.RECOVERY_ATTEMPTS);
  debug.info("Persisted session cleared");
}
export function hasPersistedSession(): boolean {
  return storage.contains(KEYS.ACTIVE_SESSION);
}
export function getTimeSinceLastPersist(): number {
  const lastSync = storage.getNumber(KEYS.LAST_SYNC);
  if (!lastSync) {
    return Infinity;
  }
  return Date.now() - lastSync;
}
function cleanupOldBackups(): void {
  const allKeys = storage.getAllKeys();
  const backupKeys = allKeys
    .filter((key) => key.startsWith(KEYS.BACKUP_PREFIX))
    .sort()
    .reverse();
  const keysToDelete = backupKeys.slice(10);
  keysToDelete.forEach((key) => storage.delete(key));
}
function recoverFromBackup(): PersistedSessionState | null {
  const allKeys = storage.getAllKeys();
  const backupKeys = allKeys
    .filter((key) => key.startsWith(KEYS.BACKUP_PREFIX))
    .sort()
    .reverse();
  for (const key of backupKeys) {
    try {
      const data = storage.getString(key);
      if (data) {
        const parsed = JSON.parse(data);
        const validated = PersistedSessionStateSchema.parse(parsed);
        debug.info("Session recovered from backup", {
          sessionId: validated.sessionId,
        });
        eventBus.publish("analytics:track", {
          event: "session_recovered_from_backup",
          properties: {
            sessionId: validated.sessionId,
            backupAge: Date.now() - parseInt(key.split(":").pop() || "0"),
          },
        });
        return validated;
      }
    } catch (error) {
      captureSilentFailure(error, {
        feature: "session",
        operation: "safe-fallback",
        type: "data",
      });
      continue;
    }
  }
  return null;
}
interface SessionHistoryEntry {
  sessionId: string;
  startedAt: number;
  endedAt: number;
  status: "COMPLETED" | "ABANDONED" | "FAILED" | "RECOVERED";
  progress: number;
}
export function addToSessionHistory(entry: SessionHistoryEntry): void {
  const history = getSessionHistory();
  history.unshift(entry);
  const trimmed = history.slice(0, 100);
  storage.set(KEYS.SESSION_HISTORY, JSON.stringify(trimmed));
}
export function getSessionHistory(): SessionHistoryEntry[] {
  try {
    const data = storage.getString(KEYS.SESSION_HISTORY);
    if (!data) {
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    captureSilentFailure(error, {
      feature: "session",
      operation: "safe-fallback",
      type: "data",
    });
    return [];
  }
}
interface RecoveryAttempt {
  timestamp: number;
  reason: string;
  success: boolean;
}
export function recordRecoveryAttempt(attempt: RecoveryAttempt): void {
  const attempts = getRecoveryAttempts();
  attempts.push(attempt);
  storage.set(KEYS.RECOVERY_ATTEMPTS, JSON.stringify(attempts.slice(-50)));
}
export function getRecoveryAttempts(): RecoveryAttempt[] {
  try {
    const data = storage.getString(KEYS.RECOVERY_ATTEMPTS);
    if (!data) {
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    captureSilentFailure(error, {
      feature: "session",
      operation: "safe-fallback",
      type: "data",
    });
    return [];
  }
}
export function getRecoverySuccessRate(): number {
  const attempts = getRecoveryAttempts();
  if (attempts.length === 0) {
    return 0;
  }
  const successful = attempts.filter((a) => a.success).length;
  return successful / attempts.length;
}
export class SessionPersistenceError extends Error {
  constructor(
    message: string,
    public details?: { cause?: unknown; sessionId?: string },
  ) {
    super(message);
    this.name = "SessionPersistenceError";
  }
}
export function isSessionStale(
  persistedAt: number,
  maxAgeMs: number = 24 * 60 * 60 * 1000,
): boolean {
  return Date.now() - persistedAt > maxAgeMs;
}
export function canResumeSession(state: PersistedSessionState): {
  canResume: boolean;
  reason?: string;
  risk: "NONE" | "LOW" | "MEDIUM" | "HIGH";
} {
  const age = Date.now() - state.lastUpdatedAt;
  if (age > 24 * 60 * 60 * 1000) {
    return {
      canResume: false,
      reason: "Session is too old (over 24 hours)",
      risk: "HIGH",
    };
  }
  if (!["ACTIVE", "PAUSED", "BACKGROUNDED"].includes(state.status)) {
    return {
      canResume: false,
      reason: `Session is in ${state.status} state`,
      risk: "NONE",
    };
  }
  if (state.interruptions > 10) {
    return {
      canResume: true,
      reason: `Session has ${state.interruptions} interruptions - quality may be affected`,
      risk: "MEDIUM",
    };
  }
  if (state.backgroundTime > 30 * 60 * 1000) {
    return {
      canResume: true,
      reason: "Session was backgrounded for extended period",
      risk: "MEDIUM",
    };
  }
  return { canResume: true, risk: "NONE" };
}
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
