/**
 * Streaks Feature Barrel Export
 */

// Types
export * from './types';
export {
  RiskLevelSchema,
  StreakSchema,
  StreakSummarySchema,
  MilestoneRewardTypeSchema,
  StreakMilestoneSchema,
  ShieldSourceSchema,
  StreakShieldSchema,
  RecoverySourceSchema,
  ComebackStateSchema,
  StreakCalendarDaySchema,
  StreakActionSchema,
  StreakEngineResultSchema,
  RecordSessionInputSchema,
  UseShieldInputSchema,
  FreezeStreakInputSchema,
  RestoreStreakInputSchema,
} from './schemas';

// Service
export * from './service';

// Phase 11.4 - Comeback Quest System
export {
  ComebackQuestCard,
  ComebackQuestCompact,
} from './components/ComebackQuestCard';
export {
  checkComebackEligibility,
  createComebackQuest,
  updateQuestProgress,
  calculateQuestProgress,
  COMEBACK_QUEST_CONFIG,
  type ComebackQuest,
  type ComebackQuestProgress,
  type ComebackQuestStage,
} from './ComebackQuestSystem';
export * as streaksRepository from './repository';

// Hooks
export * from './hooks';

// Analytics
export * from './analytics';

// Utils - risk calculator functions
export {
  calculateStreakRisk,
  getRiskLevel,
  analyzePattern,
  type RiskFactors,
  type RiskLevel,
} from './utils/risk-calculator';

// Phase 3.2 - Streak System Evolution (continued from Phase 3)
export {
  STREAK_STATES,
  STREAK_MILESTONES,
  determineStreakState,
  calculateHoursUntilStreakBreak,
  getStreakStateInfo,
  getStreakVisualIndicator,
  awardInsurance,
  getAvailableInsuranceCount,
  getUserInsurance,
  useInsurance,
  canUseInsurance,
  createRecoveryPlan,
  getRecoveryPlan,
  progressRecovery,
  clearRecoveryPlan,
  checkMilestones,
  getNextMilestone,
  getMilestoneProgress,
  getStreakDisplayText,
  getStreakCelebrationMessage,
  type StreakState,
  type StreakStateInfo,
  type StreakMilestone,
  type StreakInsurance,
  type InsuranceSource,
  type StreakRecoveryPlan,
  type StreakProtectionResult,
} from './StreakEvolutionSystem';
