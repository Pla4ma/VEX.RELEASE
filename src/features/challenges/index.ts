/**
 * Challenges Feature - Barrel Export
 */

export type {
  Challenge,
  ChallengeTemplate,
  ChallengeType,
  ChallengeStatus,
  ChallengeCategory,
  ChallengeDifficulty,
  UserChallenge,
  UserChallengeSummary,
  ProgressHistoryEntry,
  RerollResult,
  RerollEligibility,
  AssignChallengeInput,
  UpdateChallengeProgressInput,
  RerollChallengeInput,
  ClaimChallengeRewardInput,
  ChallengeGenerationConfig,
  ChallengeReward,
  ChallengeCompletionResult,
  ChallengeAnalytics,
} from './schemas';

export {
  ChallengeSchema,
  ChallengeTemplateSchema,
  ChallengeTypeSchema,
  ChallengeStatusSchema,
  ChallengeCategorySchema,
  ChallengeDifficultySchema,
  UserChallengeSchema,
  UserChallengeSummarySchema,
  ProgressHistoryEntrySchema,
  RerollResultSchema,
  RerollEligibilitySchema,
  AssignChallengeInputSchema,
  UpdateChallengeProgressInputSchema,
  RerollChallengeInputSchema,
  ClaimChallengeRewardInputSchema,
} from './schemas';

export {
  fetchChallengeById,
  fetchActiveChallenges,
  fetchChallengesByType,
  fetchChallengeTemplates,
  fetchUserChallenge,
  fetchUserChallenges,
  fetchUserActiveChallenges,
  createUserChallenge,
  updateUserChallenge,
  addChallengeProgress,
  recordReroll,
  getRerollCountToday,
  getFreeRerollCountToday,
  RepositoryError,
} from './repository';

export {
  ChallengeError,
  ChallengeNotFoundError,
  ChallengeNotActiveError,
  RerollNotAllowedError,
  RerollLimitExceededError,
  InsufficientGemsForRerollError,
} from './errors';

export {
  assignChallenge,
  updateChallengeProgress,
  claimChallengeReward,
  checkChallengeProgress,
} from './service';

export {
  checkRerollEligibility,
  rerollChallenge,
  getActiveChallenges,
  getCompletedChallenges,
  getUserChallengeSummaries,
} from './queries';

// Hooks
export {
  challengeKeys,
  useChallenge,
  useChallengesByType,
  useUserChallenges,
  useActiveChallenges,
  useChallengeSummaries,
  useUpdateChallengeProgress,
  useClaimChallengeReward,
  useChallengeProgress,
  useRerollChallenge,
  useRerollEligibility,
  useChallengeEvents,
} from './hooks';

// Analytics
export {
  trackChallengeView,
  trackChallengeAssigned,
  trackProgressUpdate,
  trackChallengeCompleted,
  trackRewardClaimed,
  trackChallengeReroll,
  trackChallengeExpired,
  calculateChallengeMetrics,
  calculateDifficultyMetrics,
  checkChallengesHealth,
} from './analytics';

// Components
export { ChallengeCard, ChallengeList } from './components';
