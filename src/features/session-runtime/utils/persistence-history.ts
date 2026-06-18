import { MMKV } from 'react-native-mmkv';
import { captureSilentFailure } from '../../../utils/silent-failure';
import { getMmkvEncryptionKeySync } from '../../../persistence/mmkv-key';

let _storage: MMKV | null = null;
function getStorage(): MMKV {
  if (!_storage) {
    _storage = new MMKV({ id: 'session-persistence', encryptionKey: getMmkvEncryptionKeySync() });
  }
  return _storage;
}

const KEYS = {
  SESSION_HISTORY: 'session:history',
} as const;

export interface SessionHistoryEntry {
  sessionId: string;
  startedAt: number;
  endedAt: number;
  status: 'COMPLETED' | 'ABANDONED' | 'FAILED' | 'RECOVERED';
  progress: number;
}

export function addToSessionHistory(entry: SessionHistoryEntry): void {
  const history = getSessionHistory();
  history.unshift(entry);
  const trimmed = history.slice(0, 100);
  getStorage().set(KEYS.SESSION_HISTORY, JSON.stringify(trimmed));
}

export function getSessionHistory(): SessionHistoryEntry[] {
  try {
    const data = getStorage().getString(KEYS.SESSION_HISTORY);
    if (!data) {
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    captureSilentFailure(error, {
      feature: 'session',
      operation: 'safe-fallback',
      type: 'data',
    });
    return [];
  }
}
