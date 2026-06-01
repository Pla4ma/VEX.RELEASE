

export const TECHNIQUES = [
  { key: 'durationMastery', label: 'Duration Focus' },
  { key: 'purityMastery', label: 'Purity', color: '#10b981' },
  {
    key: 'consistencyMastery',
    label: 'Consistency',
    color: '#f59e0b',
  },
  { key: 'comebackMastery', label: 'Comeback', color: '#ef4444' },
  { key: 'bossMastery', label: 'Boss Damage', color: '#8b5cf6' },
] as const;

export const difficultyColors = {
  EASY: '#10b981',
  MEDIUM: '#3b82f6',
  HARD: '#f59e0b',
  ELITE: '#8b5cf6',
} as const;
