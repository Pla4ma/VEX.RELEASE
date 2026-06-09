/**
 * AI Coach Store - Storage Configuration
 *
 * MMKV storage setup for Zustand persistence.
 */

import { MMKV } from 'react-native-mmkv';
import { getMmkvEncryptionKeySync } from '../../../persistence/mmkv-key';
import type { CoachUIState } from './types';

let _storage: MMKV | null = null;
function getStorage(): MMKV {
  if (!_storage) {
    _storage = new MMKV({ id: 'coach-store', encryptionKey: getMmkvEncryptionKeySync() });
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
