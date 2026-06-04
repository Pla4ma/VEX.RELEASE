import { lightColors } from '@/theme/tokens/colors';


export const TECHNIQUES = [
  { key: 'durationMastery', label: 'Duration Focus' },
  { key: 'purityMastery', label: 'Purity', color: lightColors.accent.green },
  {
    key: 'consistencyMastery',
    label: 'Consistency',
    color: lightColors.semantic.warning,
  },
  { key: 'comebackMastery', label: 'Comeback', color: lightColors.semantic.danger },
  { key: 'bossMastery', label: 'Boss Damage', color: lightColors.accent.purple },
] as const;

export const difficultyColors = {
  EASY: lightColors.accent.green,
  MEDIUM: lightColors.accent.blue,
  HARD: lightColors.semantic.warning,
  ELITE: lightColors.accent.purple,
} as const;
