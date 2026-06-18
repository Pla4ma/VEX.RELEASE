import type { ComboTierConfig } from './combo-meter-types';
import { lightColors } from '@/theme/tokens/colors';

export const COMBO_TIERS: ComboTierConfig[] = [
  {
    minCombo: 0,
    name: 'Focus',
    color: lightColors.text.muted,
    emoji: '',
    multiplier: 1,
    animation: 'pulse',
  },
  {
    minCombo: 5,
    name: 'Bronze',
    color: lightColors.semantic.warning,
    emoji: '',
    multiplier: 1.5,
    animation: 'pulse',
  },
  {
    minCombo: 10,
    name: 'Silver',
    color: lightColors.text.muted,
    emoji: '',
    multiplier: 2,
    animation: 'shake',
  },
  {
    minCombo: 15,
    name: 'Gold',
    color: lightColors.semantic.warning,
    emoji: '',
    multiplier: 3,
    animation: 'shake',
  },
  {
    minCombo: 20,
    name: 'Platinum',
    color: lightColors.accent.settled,
    emoji: '',
    multiplier: 4,
    animation: 'rainbow',
  },
  {
    minCombo: 30,
    name: 'Diamond',
    color: lightColors.accent.reflection,
    emoji: '',
    multiplier: 5,
    animation: 'rainbow',
  },
];

export function getCurrentTier(combo: number): ComboTierConfig {
  for (let i = COMBO_TIERS.length - 1; i >= 0; i--) {
    if (combo >= (COMBO_TIERS[i]?.minCombo ?? 0)) {
      return COMBO_TIERS[i] ?? COMBO_TIERS[0]!; // ponytail: COMBO_TIERS is non-empty const
    }
  }
  return COMBO_TIERS[0]!; // ponytail: COMBO_TIERS is non-empty const
}

export function getTierProgress(combo: number): number {
  const currentTier = getCurrentTier(combo);
  const nextTier = COMBO_TIERS.find((t) => t.minCombo > combo);
  if (!nextTier) {
    return 1;
  }
  const tierRange = nextTier.minCombo - currentTier.minCombo;
  const progress = combo - currentTier.minCombo;
  return progress / tierRange;
}

export function getMilestoneMessage(milestone: number): string {
  const messages: Record<number, string> = {
    5: "5 minutes. You're warming up.",
    10: '10 minutes. Keep that momentum.',
    15: "15 minutes. You're in the zone.",
    20: '20 minutes. Unstoppable.',
    25: '25 minutes. Legendary focus.',
    30: '30 minutes. Peak status reached.',
    45: "45 minutes. You're a machine.",
    60: '60 MINUTES. Absolute legend.',
  };
  return messages[milestone] || `${milestone} minutes. Amazing.`;
}

export function formatCombo(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
