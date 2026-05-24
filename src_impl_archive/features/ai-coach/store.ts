/**
 * AI Coach Store
 *
 * @deprecated This barrel file is maintained for backward compatibility.
 * Import directly from './store/useCoachStore', './store/types', etc.
 */

// Re-export all from modular store structure
export type {
  CoachUIState,
  CoachUIActions,
  CoachStore,
} from './store/types';

export {
  useCoachStore,
  resetCoachPreferences,
} from './store/useCoachStore';

export {
  mmkvStorage,
  storageConfig,
} from './store/storage';

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
} from './store/selectors';

export {
  shouldShowMessage,
  getActiveModalType,
} from './store/helpers';

