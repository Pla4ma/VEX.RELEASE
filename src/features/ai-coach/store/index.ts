/**
 * AI Coach Store - Barrel Export
 *
 * @deprecated Import directly from submodules:
 * - types.ts: Type definitions
 * - storage.ts: Storage configuration
 * - selectors.ts: State selectors
 * - helpers.ts: Utility functions
 * - useCoachStore.ts: Store hook (from store.ts)
 */

// Types
export type {
  CoachUIState,
  CoachUIActions,
  CoachStore,
} from './types';

// Storage
export { mmkvStorage, storageConfig } from './storage';

// Selectors
export {
  selectActiveMessage,
  selectIsMessageActive,
  selectShowHistory,
  selectShowPersonaSelector,
  selectSelectedPersona,
  selectMutedCategories,
  selectIsCategoryMuted,
  selectReduceNotifications,
  selectDismissedMessages,
  selectIsMessageDismissed,
  selectModalState,
  selectIsModalVisible,
} from './selectors';

// Helpers
export { shouldShowMessage, getActiveModalType } from './helpers';

// Re-export store hook and reset function from the main store file
export { useCoachStore, resetCoachPreferences } from './useCoachStore';
