/**
 * AI Coach Store - Types
 *
 * Type definitions for the coach Zustand store.
 */

import type { CoachMessage, MessageCategory } from "../schemas";

export interface CoachUIState {
  // Active message being displayed
  activeMessage: CoachMessage | null;

  // UI visibility states
  showHistory: boolean;
  showPersonaSelector: boolean;

  // User preferences
  selectedPersona: string | null;
  mutedCategories: MessageCategory[];
  reduceNotifications: boolean;
  dismissedMessages: string[];

  // Modal states
  isModalVisible: boolean;
  modalType: "message" | "persona" | "history" | "difficulty" | null;
}

export interface CoachUIActions {
  // Message actions
  setActiveMessage: (message: CoachMessage | null) => void;
  dismissMessage: (messageId: string) => void;
  clearActiveMessage: () => void;

  // UI visibility
  toggleHistory: () => void;
  openHistory: () => void;
  closeHistory: () => void;
  togglePersonaSelector: () => void;

  // Persona selection
  selectPersona: (personaId: string) => void;
  clearPersona: () => void;

  // Category muting
  muteCategory: (category: MessageCategory) => void;
  unmuteCategory: (category: MessageCategory) => void;
  toggleCategoryMute: (category: MessageCategory) => void;

  // Notification preferences
  setReduceNotifications: (reduce: boolean) => void;

  // Modal actions
  openMessageModal: () => void;
  openPersonaModal: () => void;
  openHistoryModal: () => void;
  openDifficultyModal: () => void;
  closeModal: () => void;

  // Reset
  resetUI: () => void;
}

export type CoachStore = CoachUIState & CoachUIActions;
