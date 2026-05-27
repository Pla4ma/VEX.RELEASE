import { getPriorityCandidates } from '../priority-checkers';
import {
  HomeContextSnapshotSchema,
  type HomeContextSnapshot,
  type ProductContext,
} from '../priority-schemas';
import type { FeatureAccessMap } from '../../liveops-config';

export { getPriorityCandidates, HomeContextSnapshotSchema };
export type { HomeContextSnapshot, ProductContext, FeatureAccessMap };

export const mockFeatureAccess: FeatureAccessMap = {
  boss_tab: { isUnlocked: true, isDegraded: false, state: 'unlocked' },
  challenges: { isUnlocked: true, isDegraded: false, state: 'unlocked' },
  content_study: { isUnlocked: true, isDegraded: false, state: 'unlocked' },
  premium_paywall: { isUnlocked: true, isDegraded: false, state: 'unlocked' },
  ai_coach_advanced: { isUnlocked: true, isDegraded: false, state: 'unlocked' },
  battle_pass: { isUnlocked: false, isDegraded: false, state: 'hidden' },
  companion_detail: { isUnlocked: true, isDegraded: false, state: 'unlocked' },
  notifications: { isUnlocked: true, isDegraded: false, state: 'unlocked' },
  streaks_advanced: { isUnlocked: true, isDegraded: false, state: 'unlocked' },
  squads: { isUnlocked: false, isDegraded: false, state: 'hidden' },
  economy: { isUnlocked: false, isDegraded: false, state: 'hidden' },
  coach_memory: { isUnlocked: true, isDegraded: false, state: 'unlocked' },
  products: { isUnlocked: true, isDegraded: false, state: 'unlocked' },
  session_advanced: { isUnlocked: true, isDegraded: false, state: 'unlocked' },
};

export function makeSnapshot(overrides: Partial<HomeContextSnapshot>): HomeContextSnapshot {
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
