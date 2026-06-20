/**
 * AI Coach Store - Storage Configuration
 *
 * MMKV storage setup for Zustand persistence.
 */

import {
  createRuntimeMMKV,
  type RuntimeMMKV,
} from '../../../persistence/mmkv-runtime';
import { getMmkvEncryptionKeySync } from '../../../persistence/mmkv-key';
import type { CoachUIState } from './types';

let _storage: RuntimeMMKV | null = null;
function getStorage(): RuntimeMMKV {
  if (!_storage) {
    _storage = createRuntimeMMKV({ id: 'coach-store', encryptionKey: getMmkvEncryptionKeySync() });
  }
  return _storage;
}

export const mmkvStorage = {
  getItem: (name: string): string | null => {
    const value = getStorage().getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string): void => {
    getStorage().set(name, value);
  },
  removeItem: (name: string): void => {
    getStorage().delete(name);
  },
};

export const storageConfig = {
  name: 'coach-ui-storage',
  partialize: (state: CoachUIState) => ({
    selectedPersona: state.selectedPersona,
    mutedCategories: state.mutedCategories,
    reduceNotifications: state.reduceNotifications,
    dismissedMessages: state.dismissedMessages,
  }),
};
