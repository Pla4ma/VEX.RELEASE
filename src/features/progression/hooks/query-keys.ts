export const progressionKeys = {
  all: ['progression'] as const,
  byUser: (userId: string) => [...progressionKeys.all, userId] as const,
  summary: (userId: string) =>
    [...progressionKeys.byUser(userId), 'summary'] as const,
  history: (userId: string) =>
    [...progressionKeys.byUser(userId), 'history'] as const,
  daily: (userId: string, date: string) =>
    [...progressionKeys.byUser(userId), 'daily', date] as const,
  weekly: (userId: string, weekStart: string) =>
    [...progressionKeys.byUser(userId), 'weekly', weekStart] as const,
};
