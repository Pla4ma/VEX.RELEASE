import { z } from 'zod';
import type { LaneProfile } from '../lane-engine/types';

/**
 * Premium timing gate — ensures no Day 0 hard sell, no paywall before value proof,
 * and no premium surface if RevenueCat is unhealthy.
 */
export type PremiumTimingTier =
  | 'hidden_early'        // sessions 0-4 — invisible
  | 'soft_tease'          // sessions 5-39 — hinted but not paywalled
  | 'eligible'            // session 40+ — paywall can show if RevenueCat healthy
  | 'blocked_unhealthy';  // RevenueCat unhealthy — always hidden regardless of sessions

export interface PremiumTimingResult {
  tier: PremiumTimingTier;
  canShowPaywall: boolean;
  canTeaseEntries: boolean;
  canRenderPremiumCTA: boolean;
  canShowCompletionMoment: boolean;
  reason: string;
}

const PremiumTimingInputSchema = z.object({
  completedSessions: z.number().int().min(0),
  revenueCatHealthy: z.boolean(),
  billingConfigured: z.boolean(),
}).strict();

export type PremiumTimingInput = z.input<typeof PremiumTimingInputSchema>;

export const EARLY_HIDDEN_THRESHOLD = 5;
export const TEASE_START_SESSION = 5;
export const VALUE_PROOF_THRESHOLD = 40;

/** Premium features mapped by lane — durable value, no economy mechanics */
export const PREMIUM_VALUE_MAP = {
  study: {
    features: [
      'Advanced import depth',
      'Review intelligence',
      'Deadline risk detection',
      'Weak topic planning',
    ],
    headline: 'Build the study system around your real deadlines',
    body: 'Imports, review intelligence, deadline awareness, and smart next-topic recommendations from your own material.',
  },
  run: {
    features: [
      'Advanced run recap',
      'Custom behavior modifiers',
      'Personal boss depth',
      'No currency — no paid power',
    ],
    headline: 'Turn the run into durable mastery',
    body: 'Deeper run history, personal boss arcs, advanced modifiers, and recap archives. No coins, gems, or shop power.',
  },
  project: {
    features: [
      'Long project memory',
      'Context restoration',
      'Flow window detection',
      'Project continuity',
    ],
    headline: 'Keep project context alive between sessions',
    body: 'Longer project memory, session-to-session context restoration, and flow window intelligence.',
  },
  clean: {
    features: [
      'Weekly focus intelligence',
      'Calendar windows',
      'Quiet advanced planning',
      'Memory console controls',
    ],
    headline: 'Make the quiet system smarter',
    body: 'Calendar intelligence, editable long memory, weekly clean planning, and advanced quiet automation without adding noise.',
  },
} as const;

export type PremiumLane = keyof typeof PREMIUM_VALUE_MAP;

export function resolvePremiumTiming(raw: PremiumTimingInput): PremiumTimingResult {
  const input = PremiumTimingInputSchema.parse(raw);

  // RevenueCat gate — highest priority
  if (!input.billingConfigured || !input.revenueCatHealthy) {
    return {
      tier: 'blocked_unhealthy',
      canShowPaywall: false,
      canTeaseEntries: false,
      canRenderPremiumCTA: false,
      canShowCompletionMoment: false,
      reason: 'Premium is unavailable until billing is healthy and configured.',
    };
  }

  // Day 0-4: completely hidden — no hard sell before any value
  if (input.completedSessions < EARLY_HIDDEN_THRESHOLD) {
    return {
      tier: 'hidden_early',
      canShowPaywall: false,
      canTeaseEntries: false,
      canRenderPremiumCTA: false,
      canShowCompletionMoment: false,
      reason: 'Premium is hidden during early sessions to avoid a Day 0 hard sell.',
    };
  }

  // Sessions 5-39: soft tease — hint premium exists, don't paywall
  if (input.completedSessions >= TEASE_START_SESSION && input.completedSessions < VALUE_PROOF_THRESHOLD) {
    return {
      tier: 'soft_tease',
      canShowPaywall: false,
      canTeaseEntries: true,
      canRenderPremiumCTA: false,
      canShowCompletionMoment: false,
      reason: 'Premium is teased after session 5 but paywalls only after value proof.',
    };
  }

  // Session 40+: eligible — paywall can appear when triggered
  return {
    tier: 'eligible',
    canShowPaywall: true,
    canTeaseEntries: true,
    canRenderPremiumCTA: true,
    canShowCompletionMoment: true,
    reason: 'Premium is unlocked after 40 sessions and healthy billing.',
  };
}

/** For lane-specific premium hooks — returns feature list and copy for given lane */
export function getLanePremiumValue(lane: PremiumLane): typeof PREMIUM_VALUE_MAP[PremiumLane] {
  return PREMIUM_VALUE_MAP[lane];
}

export function mapLaneProfileToPremiumLane(profile: LaneProfile): PremiumLane {
  if (profile.primaryLane === 'student') return 'study';
  if (profile.primaryLane === 'game_like') return 'run';
  if (profile.primaryLane === 'deep_creative') return 'project';
  return 'clean';
}

export function getLaneProfilePremiumValue(profile: LaneProfile): typeof PREMIUM_VALUE_MAP[PremiumLane] {
  return getLanePremiumValue(mapLaneProfileToPremiumLane(profile));
}

/** Map motivation profile to closest lane */
export function mapProfileToLane(profile: string): PremiumLane {
  const profileLower = profile.toLowerCase();
  if (profileLower.includes('study') || profileLower.includes('student') || profileLower.includes('learning')) return 'study';
  if (profileLower.includes('game') || profileLower.includes('competitive') || profileLower.includes('intense')) return 'run';
  if (profileLower.includes('creative') || profileLower.includes('creator') || profileLower.includes('deep')) return 'project';
  return 'clean';
}
