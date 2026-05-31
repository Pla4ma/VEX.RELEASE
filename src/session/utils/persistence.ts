import { captureSilentFailure } from "../../utils/silent-failure";
import { MMKV } from "react-native-mmkv";
import { z } from "zod";
import { createDebugger } from "../../utils/debug";
import { eventBus } from "../../events";
import {
  addToSessionHistory,
  getSessionHistory,
  type SessionHistoryEntry,
} from "./persistence-history";
import {
  recordRecoveryAttempt,
  getRecoveryAttempts,
  getRecoverySuccessRate,
  type RecoveryAttempt,
} from "./persistence-recovery";
import { isSessionStale, canResumeSession } from "./persistence-resume";
import { getMmkvEncryptionKeySync } from "../../persistence/mmkv-key";
const debug = createDebugger("session:persistence");
let _storage: MMKV | null = null;
function getStorage(): MMKV {
  if (!_storage) {
    _storage = new MMKV({ id: "session-persistence", encryptionKey: getMmkvEncryptionKeySync() });
  }
  return _storage;
}
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
export type { SessionHistoryEntry, RecoveryAttempt };
export { isSessionStale, canResumeSession };
export { addToSessionHistory, getSessionHistory } from "./persistence-history";
export {
  recordRecoveryAttempt,
  getRecoveryAttempts,
  getRecoverySuccessRate,
} from "./persistence-recovery";
const KEYS = {
  ACTIVE_SESSION: "session:active",
  LAST_SYNC: "session:lastSync",
  RECOVERY_ATTEMPTS: "session:recoveryAttempts",
  BACKUP_PREFIX: "session:backup:",
} as const;
export function persistSessionState(state: PersistedSessionState): void {
  try {
    const validated = PersistedSessionStateSchema.parse(state);
    const data = JSON.stringify(validated);
    getStorage().set(KEYS.ACTIVE_SESSION, data);
    getStorage().set(KEYS.LAST_SYNC, Date.now());
    const backupKey = `${KEYS.BACKUP_PREFIX}${Date.now()}`;
    getStorage().set(backupKey, data);
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
    const data = getStorage().getString(KEYS.ACTIVE_SESSION);
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
  getStorage().delete(KEYS.ACTIVE_SESSION);
  getStorage().delete(KEYS.RECOVERY_ATTEMPTS);
  debug.info("Persisted session cleared");
}
export function hasPersistedSession(): boolean {
  return getStorage().contains(KEYS.ACTIVE_SESSION);
}
export function getTimeSinceLastPersist(): number {
  const lastSync = getStorage().getNumber(KEYS.LAST_SYNC);
  if (!lastSync) return Infinity;
  return Date.now() - lastSync;
}
function cleanupOldBackups(): void {
  const allKeys = getStorage().getAllKeys();
  const backupKeys = allKeys
    .filter((key) => key.startsWith(KEYS.BACKUP_PREFIX))
    .sort()
    .reverse();
  backupKeys.slice(10).forEach((key) => getStorage().delete(key));
}
function recoverFromBackup(): PersistedSessionState | null {
  const allKeys = getStorage().getAllKeys();
  const backupKeys = allKeys
    .filter((key) => key.startsWith(KEYS.BACKUP_PREFIX))
    .sort()
    .reverse();
  for (const key of backupKeys) {
    try {
      const data = getStorage().getString(key);
      if (data) {
        const validated = PersistedSessionStateSchema.parse(JSON.parse(data));
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
export class SessionPersistenceError extends Error {
  constructor(
    message: string,
    public details?: { cause?: unknown; sessionId?: string },
  ) {
    super(message);
    this.name = "SessionPersistenceError";
  }
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
