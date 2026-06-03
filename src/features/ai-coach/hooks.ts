/**
 * AI Coach Hooks - Barrel Export
 *
 * Re-exports all hooks from the hooks/ directory.
 *
 * ARCHITECTURE NOTE: This file is the PUBLIC API barrel for ai-coach hooks.
 * All hook implementations live in the hooks/ directory.
 * Do NOT add hook implementations here — only re-exports.
 */

export { COACH_QUERY_KEYS } from './constants';

export {
  useCoachPersona,
  useCoachPersonas,
  useCoachUIState,
  useCoachUIActions,
  useHasDismissedMessage,
} from './hooks/useCoachPersona';
export { useCoachState, type UseCoachStateResult } from './hooks/useCoachState';
export { useNetworkStatus, type NetworkStatus } from './hooks/useNetworkStatus';
export {
  useCoachMessages,
  type UseCoachMessagesResult,
} from './hooks/useCoachMessages';
export {
  useCoachRecommendation,
  useCoachHomeRecommendation,
  type UseCoachRecommendationReturn,
} from './hooks/useCoachRecommendation';
export {
  useCreateRecommendation,
  useUpdateRecommendationStatus,
  type SessionRecommendation,
} from './hooks/useRecommendationMutations';
export {
  useCoachMemories,
  useCreateCoachMemory,
  type UseCoachMemoriesResult,
} from './hooks/useMemories';
export {
  useCoachRecommendations,
  useActiveCoachRecommendations,
  type ActiveCoachRecommendationsResult,
} from './hooks/useCoachRecommendations';
export {
  useCoachScreenState,
  useAskCoachQuestionMutation,
} from './hooks/useCoachScreen';
export {
  useActiveIntervention,
  type ActiveIntervention,
} from './hooks/useActiveIntervention';
