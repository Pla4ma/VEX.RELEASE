/**
 * Seasons Feature - Barrel Export
 */

// Types
export type {
  Season,
  SeasonSummary,
  SeasonDetail,
  SeasonPhase,
  SeasonContent,
  SeasonMilestone,
  UserSeasonProgress,
  UserSeasonProgressSummary,
  SeasonHistory,
  SeasonTransition,
  ArchivedSeason,
  CreateSeasonInput,
  UpdateSeasonInput,
  GetSeasonProgressInput,
  AdvanceTierInput,
  PurchasePremiumInput,
  SeasonStats,
  SeasonEngagementMetrics,
  // PHASE 14
  SeasonNarrative,
  SeasonCommunityGoal,
  RankTier,
  RankTierConfig,
  UserRankInfo,
} from './types';

// Schemas
export {
  SeasonSchema,
  SeasonSummarySchema,
  SeasonDetailSchema,
  SeasonPhaseInfoSchema,
  SeasonContentSchema,
  SeasonMilestoneSchema,
  UserSeasonProgressSchema,
  UserSeasonProgressSummarySchema,
  CreateSeasonInputSchema,
  UpdateSeasonInputSchema,
  AdvanceTierInputSchema,
  PurchasePremiumInputSchema,
} from './schemas';

// Service
export {
  getActiveSeason,
  getSeasonById,
  getSeasonSummary,
  getSeasonPhase,
  createSeason,
  updateSeason,
  activateSeason,
  endSeason,
  archiveSeason,
  getOrCreateUserProgress,
  getUserSeasonProgress,
  getUserProgressSummary,
  advanceTier,
  addSeasonXP,
  claimTierReward,
  purchasePremium,
  upgradeToPremiumPass,
  markTierClaimed,
  checkSeasonTransitions,
} from './service';

// Repository
export {
  fetchActiveSeason,
  fetchSeasonById,
  fetchSeasonsByPhase,
  createSeason as createSeasonInRepo,
  updateSeason as updateSeasonInRepo,
  archiveSeason as archiveSeasonInRepo,
  fetchUserSeasonProgress,
  createUserSeasonProgress,
  updateUserSeasonProgress,
  markTierClaimed as markTierClaimedInRepo,
  fetchUserSeasonHistory,
  createSeasonHistory,
  fetchSeasonStats,
  fetchSeasonLeaderboard,
  RepositoryError,
} from './repository';

// Hooks
export {
  seasonKeys,
  useActiveSeason,
  useSeason,
  useSeasonSummary,
  useUserSeasonProgress,
  useUserSeasonHistory,
  useSeasonLeaderboard,
  useCreateSeason,
  useUpdateSeason,
  useAdvanceTier,
  usePurchasePremium,
  useClaimSeasonTierReward,
  useClaimTierReward,
  useUpgradeToBattlePassPremium,
} from './hooks';

// Store
export {
  useSeasonStore,
  useSeasonUIState,
  useSeasonViewState,
} from './store';

// Events
export {
  initializeSeasonEventHandlers,
  publishSeasonStarted,
  publishTierUnlocked,
  publishPremiumPurchased,
} from './events';

// Utils
export {
  calculateSeasonPhase,
  calculateDaysRemaining,
  calculateTotalDays,
  shouldTriggerAlmostEnding,
  calculateTierProgress,
  calculateTotalProgress,
  calculateXpToNextTier,
  formatSeasonDates,
  formatCountdown,
} from './utils';

// Analytics
export {
  breadcrumbSeasonCreated,
  breadcrumbPhaseChanged,
  breadcrumbTierUnlocked,
  breadcrumbPremiumPurchased,
  trackSeasonError,
  trackSeasonWarning,
  trackSeasonView,
  trackTierClaim,
  trackSeasonEngagement,
} from './analytics';

// Components
export { SeasonCard, SeasonDetailView, SeasonNarrativeCard, SeasonEndCeremony } from './components';

// PHASE 14: Narrative and Rank Tiers
export {
  SEASON_NARRATIVES,
  getSeasonNarrative,
  getCompellingSeasonName,
  formatCommunityGoalProgress,
} from './narrative';

export {
  RANK_TIERS,
  getTierFromPercentile,
  getTierConfig,
  calculateUserRank,
  getTierChangeMessage,
  formatWeeklyRankReport,
} from './rank-tiers';
