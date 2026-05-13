import { captureSilentFailure } from "../../utils/silent-failure";
import { MMKV } from "react-native-mmkv";
import { z } from "zod";
import { createDebugger } from "../../utils/debug";
import { eventBus } from "../../events";


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