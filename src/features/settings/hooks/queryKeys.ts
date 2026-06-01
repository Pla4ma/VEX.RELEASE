export const settingsKeys = {
  all: ['settings'] as const,
  user: (userId: string) => [...settingsKeys.all, userId] as const,
  setting: (userId: string, key: string) =>
    [...settingsKeys.user(userId), 'setting', key] as const,
  preferences: (userId: string) =>
    [...settingsKeys.user(userId), 'preferences'] as const,
  notifications: (userId: string) =>
    [...settingsKeys.user(userId), 'notifications'] as const,
  coach: (userId: string) => [...settingsKeys.user(userId), 'coach'] as const,
  appearance: (userId: string) =>
    [...settingsKeys.user(userId), 'appearance'] as const,
  privacy: (userId: string) =>
    [...settingsKeys.user(userId), 'privacy'] as const,
  sync: (userId: string) => [...settingsKeys.user(userId), 'sync'] as const,
};
