import { launchColors } from '@theme/tokens/launch-colors';

export const TECHNIQUES = [
  { key: 'durationMastery', label: 'Duration Focus' },
  { key: 'purityMastery', label: 'Purity', color: launchColors.hex_10b981 },
  {
    key: 'consistencyMastery',
    label: 'Consistency',
    color: launchColors.hex_f59e0b,
  },
  { key: 'comebackMastery', label: 'Comeback', color: launchColors.hex_ef4444 },
  { key: 'bossMastery', label: 'Boss Damage', color: launchColors.hex_8b5cf6 },
] as const;

export const difficultyColors = {
  EASY: launchColors.hex_10b981,
  MEDIUM: launchColors.hex_3b82f6,
  HARD: launchColors.hex_f59e0b,
  ELITE: launchColors.hex_8b5cf6,
} as const;
