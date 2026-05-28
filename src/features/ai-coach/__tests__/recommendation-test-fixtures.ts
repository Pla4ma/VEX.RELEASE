import type { ContextSnapshot } from "../context-snapshot";

export const mockContext: ContextSnapshot = {
  userId: "user-123",
  capturedAt: Date.now(),
  sessionContext: { activeSession: false, duration: 25, quality: 85 },
  streakContext: {
    currentStreak: 5,
    streakAtRisk: false,
    hoursSinceLastSession: 18,
    streakRecord: 12,
  },
  progressContext: {
    currentLevel: 7,
    xpThisWeek: 1250,
    sessionsThisWeek: 8,
    averageSessionQuality: 82,
  },
  bossContext: {
    activeBoss: true,
    bossId: "boss-123",
    bossHealth: 65,
    timeRemaining: 20 * 60 * 60 * 1000,
  },
  socialContext: {
    hasSquad: true,
    squadWarActive: true,
    pendingInvites: 1,
    friendsOnline: 3,
  },
  temporalContext: {
    hourOfDay: 14,
    dayOfWeek: 3,
    isWeekend: false,
    daysSinceJoin: 45,
  },
  behaviorContext: {
    preferredTimeOfDay: "afternoon",
    typicalSessionDuration: 25,
    responseToCoach: "medium",
    lastCoachMessageAt: Date.now() - 24 * 60 * 60 * 1000,
  },
};
