/**
 * AI Coach Store - Storage Configuration
 *
 * MMKV storage setup for Zustand persistence.
 */

import { MMKV } from 'react-native-mmkv';
import type { CoachUIState } from './types';

// Storage instance
const storage = new MMKV({ id: 'coach-store' });

export const mmkvStorage = {
  getItem: (name: string): string | null => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string): void => {
    storage.set(name, value);
  },
  removeItem: (name: string): void => {
    storage.delete(name);
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
