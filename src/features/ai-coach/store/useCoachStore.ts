/**
 * AI Coach Store - Zustand Store
 *
 * Client-side state for UI preferences and dismissed messages
 * Persists via MMKV
 */

import { create, type StoreApi } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { CoachStore, CoachUIState } from './types';
import type { CoachMessage, MessageCategory } from '../schemas';
import { mmkvStorage, storageConfig } from './storage';

const initialState: CoachUIState = {
  activeMessage: null,
  showHistory: false,
  showPersonaSelector: false,
  selectedPersona: null,
  mutedCategories: [],
  reduceNotifications: false,
  dismissedMessages: [],
  isModalVisible: false,
  modalType: null,
};

export const useCoachStore = create<CoachStore>()(
  persist(
    (
      set: StoreApi<CoachStore>['setState'],
      get: StoreApi<CoachStore>['getState'],
    ) => ({
      ...initialState,

      // Message actions
      setActiveMessage: (message: CoachMessage | null) => {
        set({ activeMessage: message });
        if (message) {
          set({ isModalVisible: true, modalType: 'message' });
        }
      },

      dismissMessage: (messageId: string) => {
        const { dismissedMessages } = get();
        if (!dismissedMessages.includes(messageId)) {
          set({
            dismissedMessages: [...dismissedMessages, messageId],
            activeMessage: null,
            isModalVisible: false,
            modalType: null,
          });
        }
      },

      clearActiveMessage: () => {
        set({
          activeMessage: null,
          isModalVisible: false,
          modalType: null,
        });
      },

      // UI visibility
      toggleHistory: () => {
        set((state: CoachStore) => ({ showHistory: !state.showHistory }));
      },

      openHistory: () => {
        set({ showHistory: true });
      },

      closeHistory: () => {
        set({ showHistory: false });
      },

      togglePersonaSelector: () => {
        set((state: CoachStore) => ({
          showPersonaSelector: !state.showPersonaSelector,
        }));
      },

      // Persona selection
      selectPersona: (personaId: string) => {
        set({ selectedPersona: personaId });
      },

      clearPersona: () => {
        set({ selectedPersona: null });
      },

      // Category muting
      muteCategory: (category: MessageCategory) => {
        const { mutedCategories } = get();
        if (!mutedCategories.includes(category)) {
          set({ mutedCategories: [...mutedCategories, category] });
        }
      },

      unmuteCategory: (category: MessageCategory) => {
        const { mutedCategories } = get();
        set({
          mutedCategories: mutedCategories.filter(
            (c: MessageCategory) => c !== category,
          ),
        });
      },

      toggleCategoryMute: (category: MessageCategory) => {
        const { mutedCategories } = get();
        if (mutedCategories.includes(category)) {
          set({
            mutedCategories: mutedCategories.filter(
              (c: MessageCategory) => c !== category,
            ),
          });
        } else {
          set({ mutedCategories: [...mutedCategories, category] });
        }
      },

      // Notification preferences
      setReduceNotifications: (reduce: boolean) => {
        set({ reduceNotifications: reduce });
      },

      // Modal actions
      openMessageModal: () => {
        set({ isModalVisible: true, modalType: 'message' });
      },

      openPersonaModal: () => {
        set({ isModalVisible: true, modalType: 'persona' });
      },

      openHistoryModal: () => {
        set({ isModalVisible: true, modalType: 'history' });
      },

      openDifficultyModal: () => {
        set({ isModalVisible: true, modalType: 'difficulty' });
      },

      closeModal: () => {
        set({ isModalVisible: false, modalType: null });
      },

      // Reset
      resetUI: () => {
        set(initialState);
      },
    }),
    {
      name: storageConfig.name,
      storage: createJSONStorage(() => mmkvStorage),
      partialize: storageConfig.partialize,
    },
  ),
);

/**
 * Reset all coach preferences to defaults
 */
export function resetCoachPreferences(): void {
  useCoachStore.getState().resetUI();
}
