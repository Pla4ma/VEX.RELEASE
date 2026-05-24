export const focusScoreKeys = {
  all: ['focus-score'] as const,
  user: (userId: string) => ['focus-score', userId] as const,
  current: (userId: string) => ['focus-score', userId, 'current'] as const,
  history: (userId: string, days: number) => ['focus-score', userId, 'history', days] as const,
  monthlyInput: (userId: string, month: string) => ['focus-score', userId, 'monthly-input', month] as const,
};
