import { z } from "zod";
import { ContextSnapshotSchema } from "../context-snapshot";

export type ContextSnapshot = z.infer<typeof ContextSnapshotSchema>;

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

const BASE_SNAPSHOT: ContextSnapshot = {
  userId: "user-123",
  capturedAt: Date.now(),
  sessionContext: { activeSession: false },
  streakContext: {
    currentStreak: 5,
    streakAtRisk: false,
    hoursSinceLastSession: 10,
    streakRecord: 12,
  },
  progressContext: {
    currentLevel: 7,
    xpThisWeek: 1000,
    sessionsThisWeek: 5,
    averageSessionQuality: 80,
  },
  bossContext: { activeBoss: false },
  socialContext: {
    hasSquad: false,
    squadWarActive: false,
    pendingInvites: 0,
    friendsOnline: 0,
  },
  temporalContext: {
    hourOfDay: 14,
    dayOfWeek: 3,
    isWeekend: false,
    daysSinceJoin: 30,
  },
  behaviorContext: {
    preferredTimeOfDay: "morning",
    typicalSessionDuration: 25,
    responseToCoach: "medium",
  },
};

export function createTestSnapshot(
  overrides: DeepPartial<ContextSnapshot> = {},
): ContextSnapshot {
  return {
    ...BASE_SNAPSHOT,
    ...overrides,
    capturedAt: overrides.capturedAt ?? Date.now(),
    sessionContext: {
      ...BASE_SNAPSHOT.sessionContext,
      ...overrides.sessionContext,
    },
    streakContext: {
      ...BASE_SNAPSHOT.streakContext,
      ...overrides.streakContext,
    },
    progressContext: {
      ...BASE_SNAPSHOT.progressContext,
      ...overrides.progressContext,
    },
    bossContext: {
      ...BASE_SNAPSHOT.bossContext,
      ...overrides.bossContext,
    },
    socialContext: {
      ...BASE_SNAPSHOT.socialContext,
      ...overrides.socialContext,
    },
    temporalContext: {
      ...BASE_SNAPSHOT.temporalContext,
      ...overrides.temporalContext,
    },
    behaviorContext: {
      ...BASE_SNAPSHOT.behaviorContext,
      ...overrides.behaviorContext,
    },
  };
}
