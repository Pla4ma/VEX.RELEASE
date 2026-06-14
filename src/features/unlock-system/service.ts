import { z } from 'zod';
import {
  SignalTypeSchema,
  CompositeScoreSchema,
  FeatureUnlockStateSchema,
} from './schemas';
import type { UnlockSignal, CompositeScore, FeatureUnlockState } from './types';

export type SignalType = z.infer<typeof SignalTypeSchema>;

export const DEFAULT_WEIGHTS: Record<SignalType, number> = {
  session_completed: 1.0,
  plan_item_created: 0.4,
  plan_item_completed: 0.6,
  capture_created: 0.3,
  coach_interaction: 0.5,
  streak_maintained: 0.2,
  project_created: 0.5,
  study_plan_created: 0.5,
};

export const FEATURE_SCORE_THRESHOLDS: Record<string, number> = {
  clean_today_strip: 2,
  study_intelligence: 3,
  what_vex_learned: 3,
  focus_run: 4,
  project_thread: 5,
  challenges: 5,
  achievements: 6,
  boss_tab: 7,
  ai_coach_advanced: 8,
  quiz_review_mode: 10,
  content_study: 12,
  advanced_settings: 12,
  content_study_advanced: 18,
  premium_paywall: 40,
};

export const TEASER_STARTS: Record<string, number> = {
  companion_detail: 2,
  memory_console: 2,
  challenges: 4,
  boss_tab: 5,
  ai_coach_advanced: 6,
  content_study: 8,
  quiz_review_mode: 9,
};

export const LANE_THRESHOLDS: Record<string, Record<string, number>> = {
  student: {
    study_intelligence: 2,
    content_study: 6,
    focus_run: 3,
  },
  game_like: {
    boss_tab: 5,
    challenges: 3,
  },
  deep_creative: {
    project_thread: 3,
    creative_mode: 2,
  },
  minimal_normal: {
    clean_today_strip: 1,
    advanced_settings: 8,
  },
};

export function computeCompositeScore(signals: UnlockSignal[]): CompositeScore {
  const grouped: Record<SignalType, number> = {
    session_completed: 0,
    plan_item_created: 0,
    plan_item_completed: 0,
    capture_created: 0,
    coach_interaction: 0,
    streak_maintained: 0,
    project_created: 0,
    study_plan_created: 0,
  };

  for (const signal of signals) {
    const weight = DEFAULT_WEIGHTS[signal.type] ?? 0.5;
    grouped[signal.type] += signal.value * weight;
  }

  return CompositeScoreSchema.parse({
    total: Object.values(grouped).reduce((a, b) => a + b, 0),
    sessionScore: grouped.session_completed,
    planScore: grouped.plan_item_created + grouped.plan_item_completed,
    captureScore: grouped.capture_created,
    coachScore: grouped.coach_interaction,
    streakScore: grouped.streak_maintained,
    signalsUsed: signals.length,
  });
}

export function getEffectiveThreshold(featureId: string, lane: string | null): number {
  const base = FEATURE_SCORE_THRESHOLDS[featureId] ?? 10;
  if (!lane) return base;
  const laneThresholds = LANE_THRESHOLDS[lane];
  if (laneThresholds && laneThresholds[featureId] !== undefined) {
    return laneThresholds[featureId]!;
  }
  return base;
}

export function checkFeatureUnlock(
  featureId: string,
  score: CompositeScore,
  lane: string | null,
): FeatureUnlockState {
  const required = getEffectiveThreshold(featureId, lane);
  const current = score.total;
  const progress = Math.min(100, Math.round((current / required) * 100));
  const remaining = Math.max(0, required - current);
  const teaserThreshold = TEASER_STARTS[featureId];
  const teaser = teaserThreshold !== undefined && current >= teaserThreshold && current < required;

  return FeatureUnlockStateSchema.parse({
    featureId,
    unlocked: current >= required,
    progress,
    requiredScore: required,
    currentScore: current,
    remainingScore: remaining,
    teaser,
  });
}

export function createSignal(
  type: SignalType,
  value: number,
  timestamp?: string,
): UnlockSignal {
  return {
    type,
    value,
    weight: DEFAULT_WEIGHTS[type] ?? 0.5,
    timestamp: timestamp ?? new Date().toISOString(),
  };
}

export interface MultiSignalUnlockEngine {
  computeScore: (signals: UnlockSignal[]) => CompositeScore;
  checkFeatureUnlock: (featureId: string, score: CompositeScore, lane: string | null) => FeatureUnlockState;
  getEffectiveThreshold: (featureId: string, lane: string | null) => number;
}

export function getUnlockEngine(): MultiSignalUnlockEngine {
  return {
    computeScore: computeCompositeScore,
    checkFeatureUnlock,
    getEffectiveThreshold,
  };
}
