import { MMKV } from "react-native-mmkv";
import { captureSilentFailure } from "../../utils/silent-failure";

const storage = new MMKV({
  id: "session-persistence",
  encryptionKey: "session-secure-storage-key",
});

const KEYS = {
  SESSION_HISTORY: "session:history",
} as const;

export interface SessionHistoryEntry {
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
