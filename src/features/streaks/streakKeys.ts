export const streakKeys = {
  all: ['streaks'] as const,
  byUser: (userId: string) => [...streakKeys.all, 'user', userId] as const,
  summary: (userId: string) =>
    [...streakKeys.byUser(userId), 'summary'] as const,
  comeback: (userId: string) =>
    [...streakKeys.byUser(userId), 'comeback'] as const,
  multiplier: (userId: string) =>
    [...streakKeys.byUser(userId), 'multiplier'] as const,
};
