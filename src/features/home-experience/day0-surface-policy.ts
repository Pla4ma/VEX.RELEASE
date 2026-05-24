import { z } from 'zod';
import type { HomeSurfaceDecision, HomeSurfaceKey, HomeSurfaceMap } from './surface-decision-schemas';

export const Day0PolicyLimitSchema = z.object({
  maxVisibleSurfaces: z.number().int().positive(),
  maxPrimaryCta: z.literal(1),
  maxSpotlights: z.literal(1),
  maxTeasers: z.number().int().nonnegative(),
  noFullFeatureCards: z.literal(true),
  noPremium: z.literal(true),
  noSocialEconomyBattlePass: z.literal(true),
}).strict();

export type Day0PolicyLimits = z.infer<typeof Day0PolicyLimitSchema>;

export const DEFAULT_DAY0_POLICY: Day0PolicyLimits = {
  maxVisibleSurfaces: 7,
  maxPrimaryCta: 1,
  maxSpotlights: 1,
  maxTeasers: 2,
  noFullFeatureCards: true,
  noPremium: true,
  noSocialEconomyBattlePass: true,
};

const BLOCKED_ON_DAY0: HomeSurfaceKey[] = [
  'progress_proof',
  'focus_score',
  'progress_detail',
  'study_layer',
  'boss_compact',
  'boss_full_cta',
  'challenge_teaser',
  'premium_tease',
  'weekly_quest',
];

const FULL_FEATURE_CARD_SURFACES: HomeSurfaceKey[] = [
  'boss_compact',
  'boss_full_cta',
  'challenge_teaser',
  'weekly_quest',
  'study_layer',
  'progress_detail',
];

const DAY0_PERMITTED: HomeSurfaceKey[] = [
  'start_session',
  'coach_presence',
  'unlock_strip',
  'boss_teaser',
  'companion_thread',
];

function surfacePriority(value: HomeSurfaceDecision): number {
  switch (value) {
    case 'primary': return 100;
    case 'spotlight': return 80;
    case 'secondary': return 50;
    case 'tiny_tease': return 20;
    case 'hidden': return 0;
    case 'blocked': return 0;
  }
}

export interface Day0PolicyResult {
  valid: boolean;
  violations: string[];
  corrected: HomeSurfaceMap;
}

export function enforceDay0SurfacePolicy(
  map: HomeSurfaceMap,
  limits: Day0PolicyLimits = DEFAULT_DAY0_POLICY,
): Day0PolicyResult {
  const violations: string[] = [];
  const allKeys: HomeSurfaceKey[] = [
    'start_session', 'coach_presence', 'progress_proof', 'focus_score',
    'progress_detail', 'study_layer', 'companion_thread', 'boss_teaser',
    'boss_compact', 'boss_full_cta', 'challenge_teaser', 'unlock_strip',
    'premium_tease', 'weekly_quest',
  ];
  const corrected: Record<HomeSurfaceKey, HomeSurfaceDecision> = {} as Record<HomeSurfaceKey, HomeSurfaceDecision>;
  for (const key of allKeys) {
    corrected[key] = map[key] ?? 'hidden';
  }

  for (const key of BLOCKED_ON_DAY0) {
    const val = corrected[key];
    if (val !== 'hidden' && val !== 'blocked') {
      violations.push(`Surface "${key}" must be hidden or blocked on Day 0, got "${val}"`);
      corrected[key] = 'hidden';
    }
  }

  if (limits.noFullFeatureCards) {
    for (const key of FULL_FEATURE_CARD_SURFACES) {
      const val = corrected[key];
      if (val === 'secondary' || val === 'primary' || val === 'spotlight') {
        violations.push(`Full feature card "${key}" not allowed on Day 0, got "${val}"`);
        corrected[key] = 'hidden';
      }
    }
  }

  if (limits.noPremium) {
    if (corrected.premium_tease !== 'hidden' && corrected.premium_tease !== 'blocked') {
      violations.push(`Premium surface not allowed on Day 0, got "${corrected.premium_tease}"`);
      corrected.premium_tease = 'hidden';
    }
  }

  const visibleEntries = Object.entries(corrected)
    .filter(([, v]) => v !== 'hidden' && v !== 'blocked') as [HomeSurfaceKey, HomeSurfaceDecision][];

  if (visibleEntries.length > limits.maxVisibleSurfaces) {
    violations.push(
      `Day 0 has ${visibleEntries.length} visible surfaces, max ${limits.maxVisibleSurfaces}`,
    );
    const sorted = [...visibleEntries].sort(
      ([, a], [, b]) => surfacePriority(a) - surfacePriority(b),
    );
    while (sorted.length > limits.maxVisibleSurfaces) {
      const [dropKey] = sorted.shift()!;
      corrected[dropKey] = 'hidden';
      sorted.length += 1; // Remove from sorted
    }
  }

  const primaryCount = visibleEntries.filter(([, v]) => v === 'primary').length;
  if (primaryCount > limits.maxPrimaryCta) {
    violations.push(`Day 0 has ${primaryCount} primary CTAs, max ${limits.maxPrimaryCta}`);
    let keptPrimary = false;
    for (const [key, val] of Object.entries(corrected) as [HomeSurfaceKey, HomeSurfaceDecision][]) {
      if (val === 'primary') {
        if (!keptPrimary) {
          keptPrimary = true;
        } else {
          corrected[key] = 'secondary';
        }
      }
    }
  }

  if (primaryCount === 0) {
    violations.push('Day 0 must have exactly one primary CTA');
    corrected.start_session = 'primary';
  }

  const spotlightCount = visibleEntries.filter(([, v]) => v === 'spotlight').length;
  if (spotlightCount > limits.maxSpotlights) {
    violations.push(`Day 0 has ${spotlightCount} spotlights, max ${limits.maxSpotlights}`);
    let keptSpot = false;
    for (const [key, val] of Object.entries(corrected) as [HomeSurfaceKey, HomeSurfaceDecision][]) {
      if (val === 'spotlight') {
        if (!keptSpot) {
          keptSpot = true;
        } else {
          corrected[key] = 'secondary';
        }
      }
    }
  }

  const teaserCount = visibleEntries.filter(([, v]) => v === 'tiny_tease').length;
  if (teaserCount > limits.maxTeasers) {
    violations.push(`Day 0 has ${teaserCount} teasers, max ${limits.maxTeasers}`);
    const teasers = visibleEntries.filter(([, v]) => v === 'tiny_tease');
    const sorted = [...teasers].sort(
      ([a], [b]) => {
        const idxA = DAY0_PERMITTED.indexOf(a);
        const idxB = DAY0_PERMITTED.indexOf(b);
        return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
      },
    );
    while (sorted.length > limits.maxTeasers) {
      const [dropKey] = sorted.pop()!;
      corrected[dropKey] = 'hidden';
    }
  }

  if (limits.noSocialEconomyBattlePass) {
    const socialKeys: HomeSurfaceKey[] = [];
    for (const key of socialKeys) {
      if (corrected[key] !== 'hidden' && corrected[key] !== 'blocked') {
        violations.push(`Social/economy surface "${key}" not allowed on Day 0`);
        corrected[key] = 'hidden';
      }
    }
  }

  return { valid: violations.length === 0, violations, corrected };
}

export function isDay0SurfacePolicyValid(map: HomeSurfaceMap): boolean {
  return enforceDay0SurfacePolicy(map).valid;
}
