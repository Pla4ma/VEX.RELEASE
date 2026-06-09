export const challengeKeys = {
  all: ['challenges'] as const,
  byId: (id: string) => [...challengeKeys.all, id] as const,
  byType: (seasonId: string, type: string) =>
    [...challengeKeys.all, 'type', seasonId, type] as const,
  byUser: (userId: string) => [...challengeKeys.all, 'user', userId] as const,
  userChallenge: (userId: string, challengeId: string) =>
    [...challengeKeys.all, 'user-challenge', userId, challengeId] as const,
  active: (userId: string) => [...challengeKeys.all, 'active', userId] as const,
  completable: (userId: string) =>
    [...challengeKeys.all, 'completable', userId] as const,
};
