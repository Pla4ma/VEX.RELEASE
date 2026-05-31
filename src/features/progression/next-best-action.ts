import { z } from 'zod';

import type { FeatureKey } from '../liveops-config/feature-access';

export const NextBestActionInputSchema = z.object({
  completedSessions: z.number().min(0),
  currentStreak: z.number().min(0),
  nextUnlockFeature: z.custom<FeatureKey>().nullable(),
});
export type NextBestActionInput = z.infer<typeof NextBestActionInputSchema>;

export const NextBestActionSchema = z.object({
  title: z.string(),
  description: z.string(),
  ctaLabel: z.string(),
  rewardLabel: z.string(),
});
export type NextBestAction = z.infer<typeof NextBestActionSchema>;

const featureLabels: Record<FeatureKey, string> = {
  // Core features
  focus_session: 'focus depth',
  progress_view: 'progress view',
  ai_coach_basic: 'coach guidance',
  ai_coach_advanced: 'advanced AI coach',
  economy_basic: 'reward wallet',
  economy_advanced: 'advanced rewards',
  // Navigation tabs
  home_tab: 'home tab',
  focus_tab: 'focus tab',
  social_tab: 'social layer',
  profile_tab: 'profile tab',
  // Boss system
  boss_tab: 'boss battles',
  boss_bounties: 'boss bounties',
  // Social features
  squads: 'squads',
  rivals: 'rivals',
  // Progression systems
  battle_pass: 'battle pass',
  achievements: 'achievements',
  challenges: 'challenges',
  rankings: 'rankings',
  // Economy systems
  shop: 'shop',
  inventory: 'inventory',
  wagers: 'wagers',
  streak_insurance: 'streak insurance',
  gems_prominent: 'premium currency',
  // Content & Study
  content_study: 'content study',
  content_study_advanced: 'advanced study',
  quiz_review_mode: 'quiz mode',
  // Companion
  companion_detail: 'companion',
  memory_console: 'memory console',
  // Seasonal
  seasonal_features: 'seasonal features',
  // Paywall
  premium_paywall: 'premium',
  // Settings
  advanced_settings: 'settings',
};

export function getNextBestAction(raw: NextBestActionInput): NextBestAction {
  const input = NextBestActionInputSchema.parse(raw);
  if (input.completedSessions <= 0) {
    return {
      title: 'Start your first session',
      description:
        'Your first finish wakes up streaks, coach guidance, and the reward loop.',
      ctaLabel: 'Start first session',
      rewardLabel: 'Unlock your first streak day',
    };
  }
  if (input.completedSessions === 1) {
    return {
      title: 'Lock in your second win',
      description:
        'A second session tells VEX this is becoming a pattern, not a one-off.',
      ctaLabel: 'Start session two',
      rewardLabel: 'Move into your activating phase',
    };
  }
  if (input.completedSessions === 2) {
    const nextUnlock = input.nextUnlockFeature
      ? featureLabels[input.nextUnlockFeature]
      : 'your next layer';
    return {
      title: `Complete one more and unlock ${nextUnlock}`,
      description:
        'Three wins is the moment the app opens up without feeling noisy.',
      ctaLabel: 'Earn session three',
      rewardLabel: `Open ${nextUnlock}`,
    };
  }
  return {
    title: 'Your VEX world is opening up',
    description:
      input.currentStreak >= 3
        ? 'You have real momentum now. Keep feeding it and the deeper systems get better.'
        : 'You are past setup mode. Another clean session keeps the premium feeling alive.',
    ctaLabel: 'Start today’s session',
    rewardLabel: 'Build momentum',
  };
}
