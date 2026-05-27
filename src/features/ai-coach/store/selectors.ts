/**
 * AI Coach Store - Selectors
 *
 * Memoized selectors for accessing store state.
 */

import type { CoachStore, CoachUIState } from "./types";
import type { MessageCategory } from "../schemas";

// Message selectors
export const selectActiveMessage = (state: CoachStore) => state.activeMessage;
export const selectIsMessageActive = (state: CoachStore) =>
  state.activeMessage !== null;

// UI visibility selectors
export const selectShowHistory = (state: CoachStore) => state.showHistory;
export const selectShowPersonaSelector = (state: CoachStore) =>
  state.showPersonaSelector;

// Persona selectors
export const selectSelectedPersona = (state: CoachStore) =>
  state.selectedPersona;

// Category muting selectors
export const selectMutedCategories = (state: CoachStore) =>
  state.mutedCategories;
export const selectIsCategoryMuted =
  (category: MessageCategory) => (state: CoachStore) =>
    state.mutedCategories.includes(category);

// Notification selectors
export const selectReduceNotifications = (state: CoachStore) =>
  state.reduceNotifications;

// Dismissed messages selectors
export const selectDismissedMessages = (state: CoachStore) =>
  state.dismissedMessages;
export const selectIsMessageDismissed =
  (messageId: string) => (state: CoachStore) =>
    state.dismissedMessages.includes(messageId);

// Modal selectors
export const selectModalState = (state: CoachStore) => ({
  isVisible: state.isModalVisible,
  type: state.modalType,
});
export const selectIsModalVisible = (state: CoachStore) => state.isModalVisible;

// Preference partial state selector for persistence
export const selectPersistedState = (state: CoachUIState) => ({
  selectedPersona: state.selectedPersona,
  mutedCategories: state.mutedCategories,
  reduceNotifications: state.reduceNotifications,
  dismissedMessages: state.dismissedMessages,
});
