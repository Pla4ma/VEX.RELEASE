import { getPriorityCandidates } from '../priority-checkers';
import {
  HomeContextSnapshotSchema,
  type HomeContextSnapshot,
  type ProductContext,
} from '../priority-schemas';
import type { FeatureAccessMap, FeatureAccess } from '../../liveops-config';

export { getPriorityCandidates, HomeContextSnapshotSchema };
export type { HomeContextSnapshot, ProductContext, FeatureAccessMap };

function makeAccess(
  overrides: Partial<FeatureAccess>,
): FeatureAccess {
  return {
    key: 'focus_session',
    isUnlocked: true,
    isVisible: true,
    lockedDescription: '',
    recommendedUnlockMoment: '',
    unlockReason: '',
    releaseState: 'final_release_core' as const,
    isDegraded: false,
    ...overrides,
  };
}

export const mockFeatureAccess = {
  boss_tab: makeAccess({ key: 'boss_tab', isUnlocked: true }),
  challenges: makeAccess({ key: 'challenges', isUnlocked: true }),
  content_study: makeAccess({ key: 'content_study', isUnlocked: true }),
  premium_paywall: makeAccess({ key: 'premium_paywall', isUnlocked: true }),
  ai_coach_advanced: makeAccess({ key: 'ai_coach_advanced', isUnlocked: true }),
  battle_pass: makeAccess({ key: 'battle_pass', isUnlocked: false, isVisible: false }),
  companion_detail: makeAccess({ key: 'companion_detail', isUnlocked: true }),
  squads: makeAccess({ key: 'squads', isUnlocked: false, isVisible: false }),
  coach_memory: makeAccess({ key: 'memory_console', isUnlocked: true }),
  products: makeAccess({ key: 'achievements', isUnlocked: true }),
  session_advanced: makeAccess({ key: 'seasonal_features', isUnlocked: true }),
  focus_session: makeAccess({ key: 'focus_session' }),
  progress_view: makeAccess({ key: 'progress_view' }),
  ai_coach_basic: makeAccess({ key: 'ai_coach_basic' }),
  economy_basic: makeAccess({ key: 'economy_basic', isUnlocked: false, isVisible: false }),
  economy_advanced: makeAccess({ key: 'economy_advanced', isUnlocked: false, isVisible: false }),
  home_tab: makeAccess({ key: 'home_tab' }),
  focus_tab: makeAccess({ key: 'focus_tab' }),
  social_tab: makeAccess({ key: 'social_tab' }),
  profile_tab: makeAccess({ key: 'profile_tab' }),
  boss_bounties: makeAccess({ key: 'boss_bounties', isUnlocked: false, isVisible: false }),
  rivals: makeAccess({ key: 'rivals', isUnlocked: false, isVisible: false }),
  rankings: makeAccess({ key: 'rankings', isUnlocked: false, isVisible: false }),
  shop: makeAccess({ key: 'shop', isUnlocked: false, isVisible: false }),
  inventory: makeAccess({ key: 'inventory', isUnlocked: false, isVisible: false }),
  wagers: makeAccess({ key: 'wagers', isUnlocked: false, isVisible: false }),
  streak_insurance: makeAccess({ key: 'streak_insurance', isUnlocked: false, isVisible: false }),
  gems_prominent: makeAccess({ key: 'gems_prominent', isUnlocked: false, isVisible: false }),
  achievements: makeAccess({ key: 'achievements' }),
  content_study_advanced: makeAccess({ key: 'content_study_advanced', isUnlocked: false }),
  quiz_review_mode: makeAccess({ key: 'quiz_review_mode', isUnlocked: false }),
  memory_console: makeAccess({ key: 'memory_console' }),
  seasonal_features: makeAccess({ key: 'seasonal_features' }),
  advanced_settings: makeAccess({ key: 'advanced_settings', isUnlocked: false }),
};

export function makeSnapshot(
  overrides: Partial<HomeContextSnapshot>,
): HomeContextSnapshot {
  return HomeContextSnapshotSchema.parse({
    userId: '550e8400-e29b-41d4-a716-446655440000',
    timestamp: Date.now(),
    boss: {
      hasActiveEncounter: false,
      isFinalStrike: false,
    },
    challenge: {
      isNearDone: false,
      progressPercent: 0,
    },
    coach: {
      hasIntervention: false,
    },
    companionPromise: {
      kind: 'hidden' as const,
    },
    daily: {
      goalMinutes: 60,
      minutesFocused: 0,
      sessionsCompleted: 0,
    },
    onboarding: {
      firstSessionCompleted: false,
      isComplete: false,
    },
    recommendation: {
      hasActive: false,
    },
    streak: {
      currentDays: 0,
      isAtRisk: false,
      isComeback: false,
    },
    studyPlan: {
      dueToday: false,
      hasActivePlan: false,
      itemsDue: 0,
    },
    ...overrides,
  });
}

export const calmDayZeroProductContext: ProductContext = {
  userStage: 'new',
  totalCompletedSessions: 0,
  motivationStyle: 'calm',
  firstWeekExperience: {
    bossIntensity: 'hidden',
    currentDayStage: 'DAY_0_NOT_STARTED',
    premiumMoment: 'none',
    allowedHomeSurfaces: ['start_session'],
  },
  surfaceMap: {
    start_session: 'primary',
    coach_presence: 'tiny_tease',
    progress_proof: 'hidden',
    focus_score: 'hidden',
    progress_detail: 'hidden',
    study_layer: 'hidden',
    companion_thread: 'hidden',
    boss_teaser: 'hidden',
    boss_compact: 'hidden',
    boss_full_cta: 'blocked',
    challenge_teaser: 'hidden',
    unlock_strip: 'tiny_tease',
    premium_tease: 'hidden',
    weekly_quest: 'hidden',
  },
};
