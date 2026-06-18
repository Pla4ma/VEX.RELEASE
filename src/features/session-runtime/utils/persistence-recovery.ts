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
  RECOVERY_ATTEMPTS: 'session:recoveryAttempts',
} as const;

export interface RecoveryAttempt {
  timestamp: number;
  reason: string;
  success: boolean;
}

export function recordRecoveryAttempt(attempt: RecoveryAttempt): void {
  const attempts = getRecoveryAttempts();
  attempts.push(attempt);
  getStorage().set(KEYS.RECOVERY_ATTEMPTS, JSON.stringify(attempts.slice(-50)));
}

export function getRecoveryAttempts(): RecoveryAttempt[] {
  try {
    const data = getStorage().getString(KEYS.RECOVERY_ATTEMPTS);
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

export function getRecoverySuccessRate(): number {
  const attempts = getRecoveryAttempts();
  if (attempts.length === 0) {
    return 0;
  }
  const successful = attempts.filter((a) => a.success).length;
  return successful / attempts.length;
}
