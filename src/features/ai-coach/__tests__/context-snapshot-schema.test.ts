import {
  ContextSnapshotSchema,
  generateContextSnapshot,
} from '../session/context-snapshot';

describe('Context Snapshot Service', () => {
  describe('ContextSnapshotSchema', () => {
    it('validates valid snapshot', () => {
      const validSnapshot = {
        userId: 'user-123',
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
          bossId: 'boss-123',
          bossHealth: 65,
          timeRemaining: 48 * 60 * 60 * 1000,
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
          preferredTimeOfDay: 'morning',
          typicalSessionDuration: 25,
          responseToCoach: 'medium',
          lastCoachMessageAt: Date.now() - 24 * 60 * 60 * 1000,
        },
      };
      expect(ContextSnapshotSchema.parse(validSnapshot)).toEqual(validSnapshot);
    });

    it('rejects invalid preferredTimeOfDay', () => {
      const invalidSnapshot = {
        userId: 'user-123',
        capturedAt: Date.now(),
        sessionContext: { activeSession: false },
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
          daysSinceJoin: 45,
        },
        behaviorContext: {
          preferredTimeOfDay: 'invalid',
          typicalSessionDuration: 25,
          responseToCoach: 'medium',
        },
      };
      expect(() => ContextSnapshotSchema.parse(invalidSnapshot)).toThrow();
    });
  });

  describe('generateContextSnapshot', () => {
    it('generates snapshot for user', async () => {
      const snapshot = await generateContextSnapshot('user-123');
      expect(snapshot.userId).toBe('user-123');
      expect(snapshot.capturedAt).toBeLessThanOrEqual(Date.now());
      expect(snapshot.sessionContext).toBeDefined();
      expect(snapshot.streakContext).toBeDefined();
      expect(snapshot.progressContext).toBeDefined();
    });

    it('has valid temporal context', async () => {
      const snapshot = await generateContextSnapshot('user-123');
      expect(snapshot.temporalContext.hourOfDay).toBeGreaterThanOrEqual(0);
      expect(snapshot.temporalContext.hourOfDay).toBeLessThanOrEqual(23);
      expect(snapshot.temporalContext.dayOfWeek).toBeGreaterThanOrEqual(0);
      expect(snapshot.temporalContext.dayOfWeek).toBeLessThanOrEqual(6);
    });

    it('determines correct preferred time', async () => {
      const snapshot = await generateContextSnapshot('user-123');
      expect(['morning', 'afternoon', 'evening', 'night']).toContain(
        snapshot.behaviorContext.preferredTimeOfDay,
      );
    });
  });
});
