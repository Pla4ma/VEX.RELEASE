/**
 * FeatureFlagService — single entry point for all feature flag logic.
 *
 * Replaces 7 parallel files. Configuration lives in feature-flags.json
 * and feature-flags-extended.json; this file provides typed access
 * and re-exports from the split modules.
 */

import FLAGS from './feature-flags.json';
import FLAGS_EXT from './feature-flags-extended.json';
import type {
  FeatureKey,
  FeatureReleaseState,
  MotivationProfile,
  FeatureAccess,
  UnlockBehaviorEvidence,
} from './feature-access-types';
export {
  getFeatureAvailability,
  getFeatureAvailabilityFor,
  isFeatureAvailableForNavigation,
  isFeatureAvailableForQueries,
} from './feature-availability';
export type {
  FeatureAvailability,
  FeatureAvailabilityState,
} from './feature-availability';
import {
  resolveEffectiveThreshold as _resolveThreshold,
  resolveFeatureVisibility as _resolveVisibility,
  checkDependenciesSatisfied as _checkDeps,
  type FeatureAccessInput,
  type MotivationProfileConfig,
} from './feature-flag-resolution';
import {
  shouldRunHealthCheck as _shouldRunHealthCheck,
  getDeactivatedFeatureKeys as _getDeactivatedFeatureKeys,
} from './feature-flag-health';
import {
  isFeatureHidden as _isFeatureHidden,
  isFeatureIncluded as _isFeatureIncluded,
  getFeatureStatus as _getFeatureStatus,
  type DegradedFeatureKey,
  type FinalReleaseFeatureEntry,
  type FinalReleaseStatus,
} from './feature-flag-release';

// ── Re-export types from split modules ──

export type { DegradedFeatureKey, FinalReleaseFeatureEntry, FinalReleaseStatus } from './feature-flag-release';
export { getProductTier, getStage } from './feature-stage';
export type { MotivationProfileConfig, FeatureAccessInput } from './feature-flag-resolution';
export { FINAL_RELEASE_INCLUDED_SYSTEMS, FINAL_RELEASE_HIDDEN_SYSTEMS, APP_STORE_READINESS_CHECKLIST, FINAL_RELEASE_READINESS_CHECKLIST } from './feature-flag-release';

// ── Typed config accessors ──

export const FEATURE_BUILD_ORDER = FLAGS.buildOrder as FeatureKey[];
export const DISABLED_FEATURES = FLAGS.disabledFeatures as FeatureKey[];
export const FEATURE_RELEASE_STATES = FLAGS.releaseStates as Record<FeatureKey, FeatureReleaseState>;
/** Shape of feature-flags-extended.json */
interface FeatureFlagsExtendedConfig {
  thresholds: Record<string, number | null>;
  teaserStarts: Partial<Record<FeatureKey, number>>;
  priorities: Partial<Record<FeatureKey, number>>;
  dependencies: Partial<Record<FeatureKey, FeatureKey[]>>;
  motivationProfiles: Partial<Record<FeatureKey, MotivationProfileConfig>>;
}

const FLAGS_EXT_REC = FLAGS_EXT as FeatureFlagsExtendedConfig;
export const FEATURE_THRESHOLDS = (() => {
  const result: Record<string, number> = {};
  for (const [k, v] of Object.entries(FLAGS_EXT_REC.thresholds as Record<string, number | null>)) {
    result[k] = v === null ? Number.POSITIVE_INFINITY : v;
  }
  return result as Record<FeatureKey, number>;
})();
export const FEATURE_TEASER_STARTS = FLAGS_EXT_REC.teaserStarts as Partial<Record<FeatureKey, number>>;
export const FEATURE_PRIORITIES = FLAGS_EXT_REC.priorities as Partial<Record<FeatureKey, number>>;
export const FEATURE_DEPENDENCIES = FLAGS_EXT_REC.dependencies as Partial<Record<FeatureKey, FeatureKey[]>>;
export const FEATURE_MOTIVATION_PROFILES = FLAGS_EXT_REC.motivationProfiles as Partial<Record<FeatureKey, MotivationProfileConfig>>;
export const FINAL_RELEASE_FEATURE_MAP = FLAGS.finalReleaseMap as Record<FeatureKey, FinalReleaseFeatureEntry>;
export const DEGRADED_SURFACE_BLOCKS = FLAGS.degradedSurfaces as Record<DegradedFeatureKey, { blockedSurfaces: string[]; fallbackSurface: string }>;

// ── Feature copy constants ──

type FeatureCopy = Pick<FeatureAccess, 'lockedDescription' | 'recommendedUnlockMoment' | 'unlockReason'>;

export const DEFAULT_COPY: FeatureCopy = {
  lockedDescription: 'This layer opens after your focus rhythm is strong enough.',
  recommendedUnlockMoment: 'Keep completing focused sessions',
  unlockReason: 'Unlocks when your consistency proves the habit is real.',
};

export const FEATURE_COPY: Partial<Record<FeatureKey, FeatureCopy>> = {
  battle_pass: { lockedDescription: 'Season progress is archived until separately approved.', recommendedUnlockMoment: 'Not part of final release', unlockReason: 'Archived until separately approved.' },
  boss_tab: { lockedDescription: 'Bosses stay quiet until focus is the obvious center. When they appear, damage only means minutes focused.', recommendedUnlockMoment: 'After session 7, later for calm or study-focused styles', unlockReason: 'Unlocks after enough sessions for boss progress to reinforce focus instead of competing with it.' },
  challenges: { lockedDescription: 'Challenges turn the next focus or study target into one concrete action.', recommendedUnlockMoment: 'After session 5', unlockReason: 'Unlocks after 5 sessions when patterns are clear.' },
  companion_detail: { lockedDescription: 'Your companion reflects your real focus journey. A few sessions give it enough history to be meaningful.', recommendedUnlockMoment: 'After session 3', unlockReason: 'Unlocks after 3 sessions so your companion has real data to work with.' },
  economy_basic: { lockedDescription: 'Spendable rewards stay archived so XP, streaks, and progress remain the focus.', recommendedUnlockMoment: 'Not part of final release', unlockReason: 'Archived until separately approved.' },
  inventory: { lockedDescription: 'Customization stays hidden so focus sessions remain the only thing that matters.', recommendedUnlockMoment: 'Not part of final release', unlockReason: 'Archived until separately approved.' },
  shop: { lockedDescription: 'The shop stays closed so the app proves value before offering extras.', recommendedUnlockMoment: 'Not part of final release', unlockReason: 'Archived until separately approved.' },
  premium_paywall: { lockedDescription: 'Premium becomes visible after the core habit proves value.', recommendedUnlockMoment: 'After 5 completed sessions', unlockReason: 'Appears after five completed sessions when your focus rhythm has proven value and RevenueCat billing is healthy.' },
  streak_insurance: { lockedDescription: 'Streak recovery is gentle: comeback sessions, rhythm recovery, and fresh starts.', recommendedUnlockMoment: 'Not part of final release', unlockReason: 'Recovery tools unlock when needed, not before.' },
};

// ── Resolution functions (delegating to feature-flag-resolution) ──

export function resolveEffectiveThreshold(feature: FeatureKey, baseThreshold: number, profile: MotivationProfile | undefined): number {
  return _resolveThreshold(feature, baseThreshold, profile, FEATURE_MOTIVATION_PROFILES);
}

export function resolveBehaviorThreshold(
  feature: FeatureKey,
  threshold: number,
  sessions: number,
  evidence: UnlockBehaviorEvidence | undefined,
): number {
  if (!evidence || sessions < 3 || evidence.ignoredFeatures.includes(feature)) {
    return threshold;
  }
  if (feature === 'content_study' && evidence.studySurfaceClicks >= 3) {
    return Math.min(threshold, 5);
  }
  if (feature === 'ai_coach_advanced' && evidence.coachInteractions >= 3) {
    return Math.max(3, threshold - 2);
  }
  if (feature === 'boss_tab' && evidence.bossEngagement === 'high') {
    return Math.max(3, threshold - 2);
  }
  return threshold;
}

export function resolveFeatureVisibility(feature: FeatureKey, baseVisible: boolean, profile: MotivationProfile | undefined, sessions: number): boolean {
  return _resolveVisibility(feature, baseVisible, profile, sessions, FEATURE_MOTIVATION_PROFILES);
}
export function checkDependenciesSatisfied(feature: FeatureKey, unlockedFeatures: Set<FeatureKey>): boolean {
  return _checkDeps(feature, unlockedFeatures, FEATURE_DEPENDENCIES);
}

export function computeFeatureAccess(input: FeatureAccessInput): {
  isUnlocked: boolean;
  isVisible: boolean;
  isTeased: boolean;
  releaseState: FeatureReleaseState;
  effectiveThreshold: number;
  behaviorAdjusted: boolean;
} {
  const { feature, sessions, profile, behaviorEvidence, unlockedFeatures } = input;
  const releaseState = FEATURE_RELEASE_STATES[feature];
  const disabled = releaseState === 'final_release_deactivated' || releaseState === 'archived' || releaseState === 'final_release_internal';
  const baseThreshold = FEATURE_THRESHOLDS[feature];
  const profileThreshold = resolveEffectiveThreshold(feature, baseThreshold, profile);
  const threshold = resolveBehaviorThreshold(feature, profileThreshold, sessions, behaviorEvidence);
  const thresholdMet = !disabled && sessions >= threshold;
  const depsSatisfied = unlockedFeatures ? checkDependenciesSatisfied(feature, unlockedFeatures) : true;
  const isUnlocked = thresholdMet && depsSatisfied;
  const teaserStart = FEATURE_TEASER_STARTS[feature];
  const isTeased = !disabled && !isUnlocked && typeof teaserStart === 'number' && sessions >= teaserStart;
  const isVisible = resolveFeatureVisibility(feature, !disabled, profile, sessions);
  return {
    isUnlocked,
    isVisible,
    isTeased,
    releaseState,
    effectiveThreshold: threshold,
    behaviorAdjusted: threshold !== profileThreshold,
  };
}


// ── Final release map functions (delegating to feature-flag-release) ──

export function isFeatureHidden(feature: FeatureKey): boolean { return _isFeatureHidden(feature, FINAL_RELEASE_FEATURE_MAP); }
export function isFeatureIncluded(feature: FeatureKey): boolean { return _isFeatureIncluded(feature, FINAL_RELEASE_FEATURE_MAP); }
export function getFeatureStatus(feature: FeatureKey): FinalReleaseStatus { return _getFeatureStatus(feature, FINAL_RELEASE_FEATURE_MAP); }

// ── Degraded surface functions ──

export function getDegradedBlockedSurfaces(degradedFeatures: DegradedFeatureKey[]): string[] {
  return degradedFeatures.flatMap((key) => DEGRADED_SURFACE_BLOCKS[key]?.blockedSurfaces ?? []);
}
export function shouldBlockFullSurface(feature: DegradedFeatureKey, isDegraded: boolean): boolean {
  return isDegraded && DEGRADED_SURFACE_BLOCKS[feature] !== undefined;
}
export function getDegradedFallbackSurface(feature: DegradedFeatureKey): string {
  return DEGRADED_SURFACE_BLOCKS[feature]?.fallbackSurface ?? 'start_session';
}

// ── Health policy (delegating to feature-flag-health) ──

export function shouldRunHealthCheck(feature: FeatureKey, totalCompletedSessions: number): boolean { return _shouldRunHealthCheck(feature, totalCompletedSessions, DISABLED_FEATURES); }
export function getDeactivatedFeatureKeys(): ReadonlySet<FeatureKey> { return _getDeactivatedFeatureKeys(DISABLED_FEATURES); }
