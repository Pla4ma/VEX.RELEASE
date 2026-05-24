import { useMemo } from 'react';
import { z } from 'zod';

import { useOnboardingStore } from '../../features/onboarding/store';
import { deriveBossEngagementLevel } from './boss-engagement-signals';
import { useBossEngagementSummary } from './hooks/useBossEngagementSummary';
import { useFeatureAccess } from '../../features/liveops-config';
import { getDegradedFeatures } from '../../features/liveops-config/feature-access-store';
import { useAuthStore } from '../../store';

const BossDisplayPolicyOutputSchema = z.enum([
  'hidden',
  'subtle',
  'standard',
  'full',
  'completionOnly',
]);

export type BossDisplayPolicy = z.infer<typeof BossDisplayPolicyOutputSchema>;

const MotivationStyleSchema = z.enum([
  'calm',
  'friendly',
  'coach_led',
  'study_focused',
  'game_like',
  'intense',
]);

const BossEngagementSchema = z.enum(['none', 'low', 'medium', 'high']);

const FirstWeekStageSchema = z.enum([
  'day_0',
  'day_1_2',
  'day_3_5',
  'day_6_plus',
]);

const SurfaceSchema = z.enum([
  'home_indicator',
  'active_session',
  'completion',
  'boss_screen',
]);

export type ResolveBossDisplayPolicyInput = z.infer<typeof ResolveBossDisplayPolicyInputSchema>;

const ResolveBossDisplayPolicyInputSchema = z.object({
  motivationStyle: MotivationStyleSchema.nullish().default('calm'),
  bossEngagement: BossEngagementSchema.nullish().default('none'),
  firstWeekStage: FirstWeekStageSchema.nullish().default('day_0'),
  sessionMode: z.string().nullish(),
  surface: SurfaceSchema,
  featureAvailability: z.boolean().default(false),
});

export function resolveBossDisplayPolicy(
  raw: ResolveBossDisplayPolicyInput,
): BossDisplayPolicy {
  const input = ResolveBossDisplayPolicyInputSchema.parse(raw);

  if (!input.featureAvailability) {
    return 'hidden';
  }

  const isCalm = input.motivationStyle === 'calm' || input.motivationStyle === 'study_focused';
  const isGameLike = input.motivationStyle === 'game_like';
  const isIntense = input.motivationStyle === 'intense';

  if (isCalm) {
    return calmDisplayPolicy(input.surface);
  }

  if (isGameLike) {
    return gameLikeDisplayPolicy(input);
  }

  if (isIntense) {
    return intenseDisplayPolicy(input);
  }

  return engagementDrivenDisplayPolicy(input);
}

function calmDisplayPolicy(surface: string): BossDisplayPolicy {
  switch (surface) {
    case 'home_indicator':
      return 'subtle';
    case 'completion':
      return 'subtle';
    case 'active_session':
      return 'hidden';
    case 'boss_screen':
      return 'subtle';
    default:
      return 'hidden';
  }
}

function gameLikeDisplayPolicy(
  input: ResolveBossDisplayPolicyInput,
): BossDisplayPolicy {
  const isDay0 = input.firstWeekStage === 'day_0';

  switch (input.surface) {
    case 'home_indicator':
      return 'subtle';
    case 'completion':
      return isDay0 ? 'completionOnly' : 'standard';
    case 'active_session':
      if (isDay0) return 'hidden';
      if (input.bossEngagement === 'none' || input.bossEngagement === 'low') {
        return 'subtle';
      }
      return 'standard';
    case 'boss_screen':
      if (isDay0) return 'completionOnly';
      if (
        input.bossEngagement === 'high' ||
        input.bossEngagement === 'medium'
      ) {
        return 'full';
      }
      return 'standard';
    default:
      return 'hidden';
  }
}

function intenseDisplayPolicy(
  input: ResolveBossDisplayPolicyInput,
): BossDisplayPolicy {
  const isDay0 = input.firstWeekStage === 'day_0';

  switch (input.surface) {
    case 'home_indicator':
      return 'subtle';
    case 'completion':
      return isDay0 ? 'completionOnly' : 'standard';
    case 'active_session':
      if (isDay0) return 'hidden';
      if (input.bossEngagement === 'none') return 'hidden';
      return 'standard';
    case 'boss_screen':
      if (isDay0) return 'completionOnly';
      if (input.bossEngagement === 'high') return 'full';
      return 'standard';
    default:
      return 'hidden';
  }
}

function engagementDrivenDisplayPolicy(
  input: ResolveBossDisplayPolicyInput,
): BossDisplayPolicy {
  switch (input.surface) {
    case 'home_indicator':
      return 'subtle';
    case 'completion':
      return 'subtle';
    case 'active_session':
      if (input.bossEngagement === 'high') return 'standard';
      if (input.bossEngagement === 'medium') return 'subtle';
      return 'hidden';
    case 'boss_screen':
      if (input.bossEngagement === 'high') return 'full';
      if (input.bossEngagement === 'medium') return 'standard';
      return 'subtle';
    default:
      return 'hidden';
  }
}

export function isBossVisibleAtSurface(
  policy: BossDisplayPolicy,
): boolean {
  return policy !== 'hidden';
}

export function isCombatAllowed(
  policy: BossDisplayPolicy,
): boolean {
  return policy === 'standard' || policy === 'full';
}

export function isBossScreenUnlocked(
  policy: BossDisplayPolicy,
): boolean {
  return policy !== 'hidden' && policy !== 'completionOnly';
}

export function useBossDisplayPolicy(
  surface: z.infer<typeof SurfaceSchema>,
): BossDisplayPolicy {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const motivationStyle = useOnboardingStore((state) => state.explicitMotivationStyle);
  const featureAccess = useFeatureAccess();
  const degradedFeatures = getDegradedFeatures();
  const bossIgnored = degradedFeatures.has('boss_tab');

  const bossEngagementSummary = useBossEngagementSummary(userId);

  const bossEngagement = useMemo(
    () =>
      deriveBossEngagementLevel({
        bossIgnored,
        bossUnlocked: featureAccess.features.boss_tab.isUnlocked,
        canQueryBoss: false,
        bossRouteOpenedCount: bossEngagementSummary.bossRouteOpenedCount,
        bossCTAClickedCount: bossEngagementSummary.bossCTAClickedCount,
        bossDamageEventsCount: bossEngagementSummary.bossDamageEventsCount,
        recentSessionsWithBossProgress:
          bossEngagementSummary.recentSessionsWithBossProgress,
      }),
    [bossIgnored, featureAccess.features.boss_tab.isUnlocked, bossEngagementSummary],
  );

  return useMemo(
    () =>
      resolveBossDisplayPolicy({
        motivationStyle: (motivationStyle ?? 'calm') as z.infer<
          typeof MotivationStyleSchema
        >,
        bossEngagement,
        firstWeekStage: (featureAccess.stage ?? 'day_0') as z.infer<
          typeof FirstWeekStageSchema
        >,
        surface,
        featureAvailability: featureAccess.features.boss_tab.isUnlocked,
      }),
    [motivationStyle, bossEngagement, featureAccess.stage, surface, featureAccess.features.boss_tab.isUnlocked],
  );
}
