/**
 * Hooks Export
 *
 * Shared React hooks for the VEX application.
 */

export { useApi } from './useApi';
export { useFeatureFlags } from './useFeatureFlags';
export {
  usePresence,
  useSquadPresence,
  useActivityBroadcast,
  useFeedUpdates,
  useSquadChanges,
  useGuildQuests,
} from './useRealtime';
export { useOnlineUsers } from './useOnlineUsers';

// Phase 7 — Polish & Performance
export {
  useReducedMotion,
  useShouldAnimate,
  useAnimationPreset,
} from './useReducedMotion';
export { usePrefetchQueries, QueryKeys } from './usePrefetchQueries';

// Retention Psychology (19/10)
export { useStreakNarrative } from './useStreakNarrative';
// Use existing VariableRewardEngine from features/rewards instead
