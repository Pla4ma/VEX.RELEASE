/**
 * FeatureFlagService — single entry point for all feature flag logic.
 *
 * Replaces 7 parallel files:
 *   feature-access-config.ts, feature-resolution.ts, feature-availability.ts,
 *   final-release-feature-map.ts, feature-motivation-config.ts,
 *   feature-dependencies.ts, degraded-surfaces.ts
 *
 * Configuration lives in feature-flags.json; this file provides typed access
 * and all resolution/availability/health-policy functions.
 */

import FLAGS from './feature-flags.json';
import type {
  FeatureKey,
  FeatureReleaseState,
  MotivationProfile,
  MotivationProfileType,
  FeatureAccess,
  FeatureAccessMap,
  FeatureAccessInputs,
  UserExperienceStage,
  ProductTier,
} from './feature-access-types';

// ── Re-export types from degraded surfaces ──

export type DegradedFeatureKey =
  | 'content_study'
  | 'ai_coach_advanced'
  | 'premium_paywall'
  | 'boss_tab';

export interface FinalReleaseFeatureEntry {
  status: 'included' | 'progressive' | 'hidden' | 'premium_gated';
  label: string;
  requiresMinimumSessions?: number;
  note?: string;
}

// ── Typed config accessors ──

export const FEATURE_BUILD_ORDER = FLAGS.buildOrder as FeatureKey[];
export const DISABLED_FEATURES = FLAGS.disabledFeatures as FeatureKey[];
export const FEATURE_RELEASE_STATES = FLAGS.releaseStates as Record<
  FeatureKey,
  FeatureReleaseState
>;
export const FEATURE_THRESHOLDS = (() => {
  const result: Record<string, number> = {};
  for (const [k, v] of Object.entries(FLAGS.thresholds)) {
    result[k] = v === null ? Number.POSITIVE_INFINITY : v;
  }
  return result as Record<FeatureKey, number>;
})();
export const FEATURE_TEASER_STARTS = FLAGS.teaserStarts as Partial<
  Record<FeatureKey, number>
>;
export const FEATURE_PRIORITIES = FLAGS.priorities as Partial<
  Record<FeatureKey, number>
>;
export const FEATURE_DEPENDENCIES = FLAGS.dependencies as Partial<
  Record<FeatureKey, FeatureKey[]>
>;
export const FEATURE_MOTIVATION_PROFILES = FLAGS.motivationProfiles as Partial<
  Record<FeatureKey, MotivationProfileConfig>
>;
export const FINAL_RELEASE_FEATURE_MAP = FLAGS.finalReleaseMap as Record<
  FeatureKey,
  FinalReleaseFeatureEntry
>;
export const DEGRADED_SURFACE_BLOCKS = FLAGS.degradedSurfaces as Record<
  DegradedFeatureKey,
  { blockedSurfaces: string[]; fallbackSurface: string }
>;

// ── Motivation profile config (from JSON) ──

export interface MotivationProfileConfig {
  accelerate: MotivationProfileType[];
  accelerateOffset: number;
  restrict: MotivationProfileType[];
  restrictOffset: number;
  restrictVisibility?: boolean;
  restrictVisibilityMin?: number;
}

// ── Release classification (from JSON) ──

export type FinalReleaseStatus =
  | 'included'
  | 'progressive'
  | 'hidden'
  | 'premium_gated';

// ── Feature copy constants ──

type FeatureCopy = Pick<
  FeatureAccess,
  'lockedDescription' | 'recommendedUnlockMoment' | 'unlockReason'
>;

export const DEFAULT_COPY: FeatureCopy = {
  lockedDescription:
    'This layer opens after your focus rhythm is strong enough.',
  recommendedUnlockMoment: 'Keep completing focused sessions',
  unlockReason: 'Unlocks when your consistency proves the habit is real.',
};

export const FEATURE_COPY: Partial<Record<FeatureKey, FeatureCopy>> = {
  battle_pass: {
    lockedDescription: 'Season progress is archived until separately approved.',
    recommendedUnlockMoment: 'Not part of final release',
    unlockReason: 'Archived until separately approved.',
  },
  boss_tab: {
    lockedDescription:
      'Bosses stay quiet until focus is the obvious center. When they appear, damage only means minutes focused.',
    recommendedUnlockMoment:
      'After session 7, later for calm or study-focused styles',
    unlockReason:
      'Unlocks after enough sessions for boss progress to reinforce focus instead of competing with it.',
  },
  challenges: {
    lockedDescription:
      'Challenges turn the next focus or study target into one concrete action.',
    recommendedUnlockMoment: 'After session 5',
    unlockReason: 'Unlocks after 5 sessions when patterns are clear.',
  },
  companion_detail: {
    lockedDescription:
      'Your companion reflects your real focus journey. A few sessions give it enough history to be meaningful.',
    recommendedUnlockMoment: 'After session 3',
    unlockReason:
      'Unlocks after 3 sessions so your companion has real data to work with.',
  },
  economy_basic: {
    lockedDescription:
      'Spendable rewards stay archived so XP, streaks, and progress remain the focus.',
    recommendedUnlockMoment: 'Not part of final release',
    unlockReason: 'Archived until separately approved.',
  },
  inventory: {
    lockedDescription:
      'Customization stays hidden so focus sessions remain the only thing that matters.',
    recommendedUnlockMoment: 'Not part of final release',
    unlockReason: 'Archived until separately approved.',
  },
  shop: {
    lockedDescription:
      'The shop stays closed so the app proves value before offering extras.',
    recommendedUnlockMoment: 'Not part of final release',
    unlockReason: 'Archived until separately approved.',
  },
  premium_paywall: {
    lockedDescription:
      'Premium becomes visible after enough sessions prove the core habit is real.',
    recommendedUnlockMoment: 'After 40 completed sessions',
    unlockReason:
      'Appears when your focus rhythm is proven and RevenueCat billing is healthy.',
  },
  streak_insurance: {
    lockedDescription:
      'Streak recovery is gentle: comeback sessions, rhythm recovery, and fresh starts.',
    recommendedUnlockMoment: 'Not part of final release',
    unlockReason: 'Recovery tools unlock when needed, not before.',
  },
};

// ── Resolution functions (from feature-resolution.ts) ──

export function resolveEffectiveThreshold(
  feature: FeatureKey,
  baseThreshold: number,
  profile: MotivationProfile | undefined,
): number {
  const accel = FEATURE_MOTIVATION_PROFILES[feature];
  if (!accel || !profile) return baseThreshold;

  const primaryAccelerated = accel.accelerate.includes(profile.primary);
  const primaryRestricted = accel.restrict.includes(profile.primary);

  if (primaryAccelerated) {
    return Math.max(0, baseThreshold - accel.accelerateOffset);
  }
  if (primaryRestricted) {
    return baseThreshold + accel.restrictOffset;
  }

  const secondaryAccelerated = accel.accelerate.some((p) =>
    profile.secondary.includes(p),
  );
  const secondaryRestricted = accel.restrict.some((p) =>
    profile.secondary.includes(p),
  );

  if (
    secondaryRestricted &&
    accel.restrictVisibility &&
    !accel.restrictVisibilityMin
  ) {
    return baseThreshold + accel.restrictOffset;
  }
  if (secondaryAccelerated) {
    return Math.max(0, baseThreshold - accel.accelerateOffset);
  }

  return baseThreshold;
}

export function resolveFeatureVisibility(
  feature: FeatureKey,
  baseVisible: boolean,
  profile: MotivationProfile | undefined,
  sessions: number,
): boolean {
  if (!baseVisible) return false;
  const accel = FEATURE_MOTIVATION_PROFILES[feature];
  if (!accel || !profile) return baseVisible;

  const primaryRestricted = accel.restrict.includes(profile.primary);
  if (!primaryRestricted) return baseVisible;

  if (
    accel.restrictVisibility &&
    sessions < (accel.restrictVisibilityMin ?? Number.POSITIVE_INFINITY)
  ) {
    return false;
  }
  return true;
}

export function checkDependenciesSatisfied(
  feature: FeatureKey,
  unlockedFeatures: Set<FeatureKey>,
): boolean {
  const deps = FEATURE_DEPENDENCIES[feature];
  if (!deps || deps.length === 0) return true;
  return deps.every((dep) => unlockedFeatures.has(dep));
}

export interface FeatureAccessInput {
  feature: FeatureKey;
  sessions: number;
  profile: MotivationProfile | undefined;
  unlockedFeatures?: Set<FeatureKey>;
}

export function computeFeatureAccess(input: FeatureAccessInput): {
  isUnlocked: boolean;
  isVisible: boolean;
  isTeased: boolean;
  releaseState: FeatureReleaseState;
} {
  const { feature, sessions, profile, unlockedFeatures } = input;
  const releaseState = FEATURE_RELEASE_STATES[feature];
  const disabled =
    releaseState === 'final_release_deactivated' ||
    releaseState === 'archived' ||
    releaseState === 'final_release_internal';

  const baseThreshold = FEATURE_THRESHOLDS[feature];
  const threshold = resolveEffectiveThreshold(
    feature,
    baseThreshold,
    profile,
  );
  const thresholdMet = !disabled && sessions >= threshold;
  const depsSatisfied = unlockedFeatures
    ? checkDependenciesSatisfied(feature, unlockedFeatures)
    : true;
  const isUnlocked = thresholdMet && depsSatisfied;

  const teaserStart = FEATURE_TEASER_STARTS[feature];
  const isTeased =
    !disabled &&
    !isUnlocked &&
    typeof teaserStart === 'number' &&
    sessions >= teaserStart;
  const isVisible = resolveFeatureVisibility(
    feature,
    !disabled,
    profile,
    sessions,
  );

  return { isUnlocked, isVisible, isTeased, releaseState };
}

// ── Availability functions (from feature-availability.ts) ──

export type FeatureAvailabilityState =
  | 'hidden'
  | 'teased'
  | 'locked'
  | 'unlocked'
  | 'disabled'
  | 'degraded';

export interface FeatureAvailability {
  state: FeatureAvailabilityState;
  canRenderEntryPoint: boolean;
  canNavigate: boolean;
  canQuery: boolean;
  canUseBackend: boolean;
  canRegisterRoute: boolean;
  canSubscribeToEvents: boolean;
  canShowNotification: boolean;
  reason: string;
}

function resolveFeatureAvailability(
  feature: FeatureAccess | undefined,
  key: FeatureKey | null,
): FeatureAvailability {
  if (!feature) {
    return {
      state: 'disabled',
      canRenderEntryPoint: false,
      canNavigate: false,
      canQuery: false,
      canUseBackend: false,
      canRegisterRoute: false,
      canSubscribeToEvents: false,
      canShowNotification: false,
      reason: 'Feature not configured.',
    };
  }

  const disabled =
    !feature.isVisible ||
    feature.releaseState === 'final_release_deactivated' ||
    feature.releaseState === 'archived';

  if (disabled) {
    return {
      state: 'disabled',
      canRenderEntryPoint: false,
      canNavigate: false,
      canQuery: false,
      canUseBackend: false,
      canRegisterRoute: false,
      canSubscribeToEvents: false,
      canShowNotification: false,
      reason: feature.lockedDescription,
    };
  }

  if (feature.isUnlocked) {
    if (feature.isDegraded === true) {
      if (feature.disableOnDegraded) {
        return {
          state: 'disabled',
          canRenderEntryPoint: false,
          canNavigate: false,
          canQuery: false,
          canUseBackend: false,
          canRegisterRoute: false,
          canSubscribeToEvents: false,
          canShowNotification: false,
          reason: feature.lockedDescription,
        };
      }
      return {
        state: 'degraded',
        canRenderEntryPoint: true,
        canNavigate: false,
        canQuery: false,
        canUseBackend: false,
        canRegisterRoute: true,
        canSubscribeToEvents: false,
        canShowNotification: false,
        reason: feature.unlockReason,
      };
    }

    return {
      state: 'unlocked',
      canRenderEntryPoint: true,
      canNavigate: true,
      canQuery: true,
      canUseBackend: true,
      canRegisterRoute: true,
      canSubscribeToEvents: true,
      canShowNotification: true,
      reason: feature.unlockReason,
    };
  }

  if (feature.isTeased) {
    return {
      state: 'teased',
      canRenderEntryPoint: true,
      canNavigate: false,
      canQuery: false,
      canUseBackend: false,
      canRegisterRoute: false,
      canSubscribeToEvents: false,
      canShowNotification: false,
      reason: feature.recommendedUnlockMoment,
    };
  }

  return {
    state: 'locked',
    canRenderEntryPoint: false,
    canNavigate: false,
    canQuery: false,
    canUseBackend: false,
    canRegisterRoute: false,
    canSubscribeToEvents: false,
    canShowNotification: false,
    reason: feature.lockedDescription,
  };
}

/** @deprecated Use getFeatureAvailabilityFor for feature-specific routing, premium, prefetch, and notifications. */
export function getFeatureAvailability(
  feature: FeatureAccess,
): FeatureAvailability {
  return resolveFeatureAvailability(feature, null);
}

export function getFeatureAvailabilityFor(
  key: FeatureKey,
  feature: FeatureAccess,
): FeatureAvailability {
  return resolveFeatureAvailability(feature, key);
}

export function isFeatureAvailableForNavigation(
  availability: FeatureAvailability,
): boolean {
  return availability.canNavigate && availability.canRegisterRoute;
}

export function isFeatureAvailableForQueries(
  availability: FeatureAvailability,
): boolean {
  return availability.canQuery && availability.canUseBackend;
}

// ── Final release map functions (from final-release-feature-map.ts) ──

export function isFeatureHidden(feature: FeatureKey): boolean {
  return FINAL_RELEASE_FEATURE_MAP[feature]?.status === 'hidden';
}

export function isFeatureIncluded(feature: FeatureKey): boolean {
  return FINAL_RELEASE_FEATURE_MAP[feature]?.status === 'included';
}

export function getFeatureStatus(feature: FeatureKey): FinalReleaseStatus {
  return FINAL_RELEASE_FEATURE_MAP[feature]?.status ?? 'hidden';
}

export const FINAL_RELEASE_INCLUDED_SYSTEMS = [
  'motivation_onboarding',
  'adaptive_home',
  'start_session',
  'session_completion',
  'coach_presence',
  'progress_streak',
  'study_deep_work_layer',
  'subtle_boss_momentum',
  'basic_settings_privacy',
] as const;

export const FINAL_RELEASE_HIDDEN_SYSTEMS = [
  'shop',
  'inventory',
  'battle_pass',
  'wagers',
  'rivals',
  'squads_social',
  'leaderboards',
  'premium_currency',
  'advanced_economy',
  'guild_community_boss',
] as const;

export const APP_STORE_READINESS_CHECKLIST = [
  { item: 'App name', required: true },
  { item: 'Bundle ID', required: true },
  { item: 'Support email', required: true },
  { item: 'Privacy policy URL', required: true },
  { item: 'Terms of service URL', required: true },
  { item: 'Notification copy reviewed', required: true },
  { item: 'RevenueCat real or hidden (not fake)', required: true },
  { item: 'Sentry configured', required: true },
  { item: 'No production shims', required: true },
  { item: 'No debug flags in release', required: true },
  { item: 'No fake premium claims', required: true },
  { item: 'No archived feature routes', required: true },
] as const;

export const FINAL_RELEASE_READINESS_CHECKLIST = APP_STORE_READINESS_CHECKLIST;

// ── Degraded surface functions (from degraded-surfaces.ts) ──

export function getDegradedBlockedSurfaces(
  degradedFeatures: DegradedFeatureKey[],
): string[] {
  return degradedFeatures.flatMap(
    (key) => DEGRADED_SURFACE_BLOCKS[key]?.blockedSurfaces ?? [],
  );
}

export function shouldBlockFullSurface(
  feature: DegradedFeatureKey,
  isDegraded: boolean,
): boolean {
  return isDegraded && DEGRADED_SURFACE_BLOCKS[feature] !== undefined;
}

export function getDegradedFallbackSurface(
  feature: DegradedFeatureKey,
): string {
  return DEGRADED_SURFACE_BLOCKS[feature]?.fallbackSurface ?? 'start_session';
}

// ── Stage/tier functions ──

export function getStage(
  totalCompletedSessions: number,
): UserExperienceStage {
  if (totalCompletedSessions <= 0) return 'NEW_USER';
  if (totalCompletedSessions < 3) return 'ACTIVATING';
  if (totalCompletedSessions < 10) return 'ENGAGED';
  return 'POWER_USER';
}

export function getProductTier(
  stage: UserExperienceStage,
  totalCompletedSessions: number,
): ProductTier {
  if (totalCompletedSessions >= 40) return 'SOCIAL_DEPTH';
  if (totalCompletedSessions >= 20) return 'RPG_DEPTH';
  if (totalCompletedSessions >= 10) return 'STUDY_OS';
  if (stage === 'ENGAGED') return 'COACHING';
  return 'CORE_EXECUTION';
}

// ── Health policy (from feature-health-policy.ts) ──

const ROOT_ELIGIBLE: ReadonlySet<FeatureKey> = new Set([
  'content_study',
  'content_study_advanced',
]);

const PROXIMITY_GATED: ReadonlyMap<FeatureKey, number> = new Map([
  ['premium_paywall', 5],
  ['boss_tab', 7],
  ['ai_coach_advanced', 8],
]);

export function shouldRunHealthCheck(
  feature: FeatureKey,
  totalCompletedSessions: number,
): boolean {
  if (DISABLED_FEATURES.includes(feature)) return false;
  if (ROOT_ELIGIBLE.has(feature)) return true;
  const proximitySession = PROXIMITY_GATED.get(feature);
  if (proximitySession !== undefined) {
    return totalCompletedSessions >= proximitySession;
  }
  return false;
}

export function getDeactivatedFeatureKeys(): ReadonlySet<FeatureKey> {
  return new Set(DISABLED_FEATURES);
}
