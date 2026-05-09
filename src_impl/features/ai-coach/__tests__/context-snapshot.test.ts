import { ContextSnapshotSchema, determineInterventionPriority, generateCoachPrompt, generateContextSnapshot, getContextHash, shouldCoachIntervene } from '../context-snapshot';

describe('Context Snapshot Service', () => {
  describe('ContextSnapshotSchema', () => {
    it('validates valid snapshot', () => {
      const validSnapshot = {
        userId: 'user-123',
        capturedAt: Date.now(),
        sessionContext: {
          activeSession: false,
          duration: 25,
          quality: 85,
        },
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

      expect(['morning', 'afternoon', 'evening', 'night']).toContain(snapshot.behaviorContext.preferredTimeOfDay);
    });
  });

  describe('determineInterventionPriority', () => {
    it('returns critical when streak at risk', () => {
      const snapshot = {
        userId: 'user-123',
        capturedAt: Date.now(),
        sessionContext: { activeSession: false },
        streakContext: {
          currentStreak: 5,
          streakAtRisk: true,
          hoursSinceLastSession: 20,
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
          preferredTimeOfDay: 'morning',
          typicalSessionDuration: 25,
          responseToCoach: 'medium',
        },
      };

      expect(determineInterventionPriority(snapshot)).toBe('critical');
    });

    it('returns high when boss ending soon', () => {
      const snapshot = {
        userId: 'user-123',
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
        bossContext: {
          activeBoss: true,
          bossId: 'boss-123',
          bossHealth: 30,
          timeRemaining: 12 * 60 * 60 * 1000, // 12 hours
        },
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
          preferredTimeOfDay: 'morning',
          typicalSessionDuration: 25,
          responseToCoach: 'medium',
        },
      };

      expect(determineInterventionPriority(snapshot)).toBe('high');
    });

    it('returns medium when hours since session high', () => {
      const snapshot = {
        userId: 'user-123',
        capturedAt: Date.now(),
        sessionContext: { activeSession: false },
        streakContext: {
          currentStreak: 3,
          streakAtRisk: false,
          hoursSinceLastSession: 25,
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
          preferredTimeOfDay: 'morning',
          typicalSessionDuration: 25,
          responseToCoach: 'medium',
        },
      };

      expect(determineInterventionPriority(snapshot)).toBe('medium');
    });

    it('returns low for normal context', () => {
      const snapshot = {
        userId: 'user-123',
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
          preferredTimeOfDay: 'morning',
          typicalSessionDuration: 25,
          responseToCoach: 'medium',
        },
      };

      expect(determineInterventionPriority(snapshot)).toBe('low');
    });
  });

  describe('generateCoachPrompt', () => {
    it('includes user context in prompt', () => {
      const snapshot = {
        userId: 'user-123',
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
          preferredTimeOfDay: 'morning',
          typicalSessionDuration: 25,
          responseToCoach: 'medium',
        },
      };

      const prompt = generateCoachPrompt(snapshot);

      expect(prompt).toContain('VEX AI Coach');
      expect(prompt).toContain('Streak: 5 days');
      expect(prompt).toContain('Level: 7');
    });

    it('includes critical priority for at-risk streak', () => {
      const snapshot = {
        userId: 'user-123',
        capturedAt: Date.now(),
        sessionContext: { activeSession: false },
        streakContext: {
          currentStreak: 5,
          streakAtRisk: true,
          hoursSinceLastSession: 20,
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
          preferredTimeOfDay: 'morning',
          typicalSessionDuration: 25,
          responseToCoach: 'medium',
        },
      };

      const prompt = generateCoachPrompt(snapshot);

      expect(prompt).toContain('CRITICAL');
      expect(prompt).toContain('streak is at risk');
    });
  });

  describe('shouldCoachIntervene', () => {
    it('returns false if recent intervention', () => {
      const snapshot = {
        userId: 'user-123',
        capturedAt: Date.now(),
        sessionContext: { activeSession: false },
        streakContext: {
          currentStreak: 5,
          streakAtRisk: false,
          hoursSinceLastSession: 25,
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
          hourOfDay: 9,
          dayOfWeek: 3,
          isWeekend: false,
          daysSinceJoin: 30,
        },
        behaviorContext: {
          preferredTimeOfDay: 'morning',
          typicalSessionDuration: 25,
          responseToCoach: 'medium',
        },
      };

      // Recent intervention (2 hours ago)
      expect(shouldCoachIntervene(snapshot, Date.now() - 2 * 60 * 60 * 1000)).toBe(false);
    });

    it('returns true for at-risk streak regardless of timing', () => {
      const snapshot = {
        userId: 'user-123',
        capturedAt: Date.now(),
        sessionContext: { activeSession: false },
        streakContext: {
          currentStreak: 5,
          streakAtRisk: true,
          hoursSinceLastSession: 20,
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
          preferredTimeOfDay: 'morning',
          typicalSessionDuration: 25,
          responseToCoach: 'medium',
        },
      };

      expect(shouldCoachIntervene(snapshot, Date.now() - 1 * 60 * 60 * 1000)).toBe(true);
    });

    it('returns true for optimal time', () => {
      const snapshot = {
        userId: 'user-123',
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
          hourOfDay: 9, // Morning optimal time
          dayOfWeek: 3,
          isWeekend: false,
          daysSinceJoin: 30,
        },
        behaviorContext: {
          preferredTimeOfDay: 'morning',
          typicalSessionDuration: 25,
          responseToCoach: 'medium',
        },
      };

      expect(shouldCoachIntervene(snapshot, Date.now() - 5 * 60 * 60 * 1000)).toBe(true);
    });
  });

  describe('getContextHash', () => {
    it('generates consistent hash', () => {
      const snapshot = {
        userId: 'user-123',
        capturedAt: 1234567890,
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
          preferredTimeOfDay: 'morning',
          typicalSessionDuration: 25,
          responseToCoach: 'medium',
        },
      };

      const hash = getContextHash(snapshot);

      expect(hash).toContain('ctx-');
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(4);
    });
  });
});
