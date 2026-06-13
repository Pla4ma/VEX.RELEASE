import { FEATURE_UNLOCK_GATES } from '../../onboarding/onboarding-gates';
import type { FeatureUnlockGate } from '../../onboarding/onboarding-types';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

export const GLOW_COLORS = [
  vexLightGlass.mint[300],
  vexLightGlass.mint[200],
  vexLightGlass.semantic.success,
  vexLightGlass.background.atmosphericMint,
  'rgba(255, 255, 255, 0.8)',
];

export const GLOW_PARTICLES = 5;

export function findGate(featureKey: string): FeatureUnlockGate | undefined {
  return FEATURE_UNLOCK_GATES.find((g) => g.featureId === featureKey);
}

export function mapLiveopsFeatureName(featureKey: string): string {
  const names: Record<string, string> = {
    companion_detail: 'Companion Detail',
    challenges: 'Challenges',
    boss_tab: 'Boss Encounters',
    ai_coach_advanced: 'AI Coach Advanced',
    content_study: 'Study Mode',
    content_study_advanced: 'Advanced Study',
    memory_console: 'Memory Console',
    economy_basic: 'Progress Economy',
    quiz_review_mode: 'Quiz Review',
    achievements: 'Achievements',
    advanced_settings: 'Advanced Settings',
    premium_paywall: 'Premium',
  };
  return names[featureKey] ?? featureKey.replace(/_/g, ' ');
}

export interface FeatureDisplay {
  name: string;
  color: string;
  icon: string;
  description: string;
}

export function resolveFeatureDisplay(
  featureKey: string,
  gate: FeatureUnlockGate | undefined,
): FeatureDisplay {
  return {
    name: gate?.featureName ?? mapLiveopsFeatureName(featureKey),
    color: gate?.color ?? vexLightGlass.mint[500],
    icon: gate?.icon ?? '🔓',
    description: gate?.description ?? 'A new layer has opened.',
  };
}
