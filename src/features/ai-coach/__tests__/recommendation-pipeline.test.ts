import {
  batchProcessRecommendations,
  CoachRecommendationSchema,
  filterActiveRecommendations,
  formatRecommendation,
  generateRecommendations,
  getTopRecommendation,
  isRecommendationRelevant,
  trackRecommendationInteraction,
} from '../recommendation-pipeline';
import type { ContextSnapshot } from '../context-snapshot';

describe('Recommendation Pipeline', () => {
  const mockContext: ContextSnapshot = {
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
      preferredTimeOfDay: 'afternoon',
      typicalSessionDuration: 25,
      responseToCoach: 'medium',
      lastCoachMessageAt: Date.now() - 24 * 60 * 60 * 1000,
    },
  };

  describe('CoachRecommendationSchema', () => {
    it('validates valid recommendation', () => {
      const validRecommendation = {
        id: 'rec-123',
        userId: 'user-123',
        type: 'session',
        title: 'Protect Your Streak',
        description: 'Complete a session to keep your streak',
        reasoning: 'Streak at risk',
        confidence: 0.95,
        priority: 'critical',
        actionType: 'start_session',
        suggestedDuration: 15,
        suggestedDifficulty: 'easy',
        expiresAt: Date.now() + 6 * 60 * 60 * 1000,
      };

      expect(CoachRecommendationSchema.parse(validRecommendation)).toEqual(validRecommendation);
    });

    it('rejects invalid type', () => {
      expect(() =>
        CoachRecommendationSchema.parse({
          id: 'rec-123',
          userId: 'user-123',
          type: 'invalid_type',
          title: 'Test',
          description: 'Test',
          reasoning: 'Test',
          confidence: 0.5,
          priority: 'low',
          actionType: 'start_session',
          expiresAt: Date.now(),
        })
      ).toThrow();
    });

    it('rejects confidence out of range', () => {
      expect(() =>
        CoachRecommendationSchema.parse({
          id: 'rec-123',
          userId: 'user-123',
          type: 'session',
          title: 'Test',
          description: 'Test',
          reasoning: 'Test',
          confidence: 1.5,
          priority: 'low',
          actionType: 'start_session',
          expiresAt: Date.now(),
        })
      ).toThrow();
    });
  });

  describe('generateRecommendations', () => {
    it('generates recommendations based on context', async () => {
      const recommendations = await generateRecommendations('user-123', mockContext);

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0]).toHaveProperty('title');
      expect(recommendations[0]).toHaveProperty('priority');
    });

    it('includes boss recommendation when boss active', async () => {
      const recommendations = await generateRecommendations('user-123', mockContext);

      const bossRec = recommendations.find((r) => r.title.includes('Boss'));
      expect(bossRec).toBeDefined();
      expect(bossRec?.priority).toBe('high');
    });

    it('includes squad war recommendation when war active', async () => {
      const recommendations = await generateRecommendations('user-123', mockContext);

      const warRec = recommendations.find((r) => r.title.includes('War'));
      expect(warRec).toBeDefined();
    });

    it('sorts by priority (critical first)', async () => {
      const contextWithStreakRisk = {
        ...mockContext,
        streakContext: {
          ...mockContext.streakContext,
          streakAtRisk: true,
        },
      };

      const recommendations = await generateRecommendations('user-123', contextWithStreakRisk);

      expect(recommendations[0].priority).toBe('critical');
    });
  });

  describe('filterActiveRecommendations', () => {
    it('filters out expired recommendations', () => {
      const now = Date.now();
      const recommendations = [
        {
          id: 'rec-1',
          userId: 'user-123',
          type: 'session' as const,
          title: 'Active',
          description: 'Test',
          reasoning: 'Test',
          confidence: 0.9,
          priority: 'high' as const,
          actionType: 'start_session' as const,
          expiresAt: now + 60 * 60 * 1000,
        },
        {
          id: 'rec-2',
          userId: 'user-123',
          type: 'session' as const,
          title: 'Expired',
          description: 'Test',
          reasoning: 'Test',
          confidence: 0.9,
          priority: 'low' as const,
          actionType: 'start_session' as const,
          expiresAt: now - 60 * 60 * 1000,
        },
      ];

      const active = filterActiveRecommendations(recommendations);

      expect(active.length).toBe(1);
      expect(active[0].title).toBe('Active');
    });
  });

  describe('getTopRecommendation', () => {
    it('returns highest priority recommendation', () => {
      const now = Date.now();
      const recommendations = [
        {
          id: 'rec-1',
          userId: 'user-123',
          type: 'session' as const,
          title: 'Low',
          description: 'Test',
          reasoning: 'Test',
          confidence: 0.9,
          priority: 'low' as const,
          actionType: 'start_session' as const,
          expiresAt: now + 60 * 60 * 1000,
        },
        {
          id: 'rec-2',
          userId: 'user-123',
          type: 'session' as const,
          title: 'High',
          description: 'Test',
          reasoning: 'Test',
          confidence: 0.9,
          priority: 'high' as const,
          actionType: 'start_session' as const,
          expiresAt: now + 60 * 60 * 1000,
        },
      ];

      const top = getTopRecommendation(recommendations);

      expect(top?.title).toBe('High');
    });

    it('returns null for empty array', () => {
      expect(getTopRecommendation([])).toBeNull();
    });

    it('returns null when all expired', () => {
      const now = Date.now();
      const recommendations = [
        {
          id: 'rec-1',
          userId: 'user-123',
          type: 'session' as const,
          title: 'Expired',
          description: 'Test',
          reasoning: 'Test',
          confidence: 0.9,
          priority: 'high' as const,
          actionType: 'start_session' as const,
          expiresAt: now - 60 * 60 * 1000,
        },
      ];

      expect(getTopRecommendation(recommendations)).toBeNull();
    });
  });

  describe('isRecommendationRelevant', () => {
    it('returns false for expired recommendation', () => {
      const now = Date.now();
      const recommendation = {
        id: 'rec-1',
        userId: 'user-123',
        type: 'session' as const,
        title: 'Test',
        description: 'Test',
        reasoning: 'Test',
        confidence: 0.9,
        priority: 'high' as const,
        actionType: 'start_session' as const,
        expiresAt: now - 60 * 60 * 1000,
      };

      expect(isRecommendationRelevant(recommendation, mockContext)).toBe(false);
    });

    it('returns false for session recommendation when active session', () => {
      const now = Date.now();
      const recommendation = {
        id: 'rec-1',
        userId: 'user-123',
        type: 'session' as const,
        title: 'Test',
        description: 'Test',
        reasoning: 'Test',
        confidence: 0.9,
        priority: 'high' as const,
        actionType: 'start_session' as const,
        expiresAt: now + 60 * 60 * 1000,
      };

      const contextWithActiveSession = {
        ...mockContext,
        sessionContext: { activeSession: true },
      };

      expect(isRecommendationRelevant(recommendation, contextWithActiveSession)).toBe(false);
    });

    it('returns false for break when few sessions', () => {
      const now = Date.now();
      const recommendation = {
        id: 'rec-1',
        userId: 'user-123',
        type: 'break' as const,
        title: 'Test',
        description: 'Test',
        reasoning: 'Test',
        confidence: 0.9,
        priority: 'low' as const,
        actionType: 'take_break' as const,
        expiresAt: now + 60 * 60 * 1000,
      };

      const contextWithFewSessions = {
        ...mockContext,
        progressContext: { ...mockContext.progressContext, sessionsThisWeek: 3 },
      };

      expect(isRecommendationRelevant(recommendation, contextWithFewSessions)).toBe(false);
    });

    it('returns false for social when no squad', () => {
      const now = Date.now();
      const recommendation = {
        id: 'rec-1',
        userId: 'user-123',
        type: 'social' as const,
        title: 'Test',
        description: 'Test',
        reasoning: 'Test',
        confidence: 0.9,
        priority: 'medium' as const,
        actionType: 'join_squad' as const,
        expiresAt: now + 60 * 60 * 1000,
      };

      const contextWithoutSquad = {
        ...mockContext,
        socialContext: { ...mockContext.socialContext, hasSquad: false },
      };

      expect(isRecommendationRelevant(recommendation, contextWithoutSquad)).toBe(false);
    });

    it('returns true for valid recommendation', () => {
      const now = Date.now();
      const recommendation = {
        id: 'rec-1',
        userId: 'user-123',
        type: 'time' as const,
        title: 'Test',
        description: 'Test',
        reasoning: 'Test',
        confidence: 0.9,
        priority: 'medium' as const,
        actionType: 'start_session' as const,
        expiresAt: now + 60 * 60 * 1000,
      };

      expect(isRecommendationRelevant(recommendation, mockContext)).toBe(true);
    });
  });

  describe('formatRecommendation', () => {
    it('formats session recommendation', () => {
      const recommendation = {
        id: 'rec-1',
        userId: 'user-123',
        type: 'session' as const,
        title: 'Protect Streak',
        description: 'Keep your streak alive',
        reasoning: 'Test',
        confidence: 0.9,
        priority: 'critical' as const,
        actionType: 'start_session' as const,
        suggestedDuration: 15,
        suggestedDifficulty: 'easy' as const,
        expiresAt: Date.now() + 60 * 60 * 1000,
      };

      const formatted = formatRecommendation(recommendation);

      expect(formatted.title).toBe('Protect Streak');
      expect(formatted.subtitle).toBe('Keep your streak alive');
      expect(formatted.cta).toContain('Easy Start');
      expect(formatted.cta).toContain('15m');
    });

    it('formats break recommendation', () => {
      const recommendation = {
        id: 'rec-1',
        userId: 'user-123',
        type: 'break' as const,
        title: 'Take a Break',
        description: 'Rest and recover',
        reasoning: 'Test',
        confidence: 0.9,
        priority: 'low' as const,
        actionType: 'take_break' as const,
        expiresAt: Date.now() + 60 * 60 * 1000,
      };

      const formatted = formatRecommendation(recommendation);

      expect(formatted.cta).toBe('Take Break');
    });

    it('formats squad recommendation', () => {
      const recommendation = {
        id: 'rec-1',
        userId: 'user-123',
        type: 'social' as const,
        title: 'Join Squad War',
        description: 'Help your squad win',
        reasoning: 'Test',
        confidence: 0.9,
        priority: 'medium' as const,
        actionType: 'join_squad' as const,
        expiresAt: Date.now() + 60 * 60 * 1000,
      };

      const formatted = formatRecommendation(recommendation);

      expect(formatted.cta).toBe('View Squad');
    });
  });

  describe('trackRecommendationInteraction', () => {
    it('tracks view without error', async () => {
      await expect(
        trackRecommendationInteraction('rec-1', 'user-123', 'viewed')
      ).resolves.not.toThrow();
    });

    it('tracks acceptance without error', async () => {
      await expect(
        trackRecommendationInteraction('rec-1', 'user-123', 'accepted')
      ).resolves.not.toThrow();
    });

    it('tracks dismissal without error', async () => {
      await expect(
        trackRecommendationInteraction('rec-1', 'user-123', 'dismissed')
      ).resolves.not.toThrow();
    });
  });

  describe('batchProcessRecommendations', () => {
    it('groups recommendations by priority', () => {
      const now = Date.now();
      const recommendations = [
        {
          id: 'rec-1',
          userId: 'user-123',
          type: 'session' as const,
          title: 'Critical',
          description: 'Test',
          reasoning: 'Test',
          confidence: 0.9,
          priority: 'critical' as const,
          actionType: 'start_session' as const,
          expiresAt: now + 60 * 60 * 1000,
        },
        {
          id: 'rec-2',
          userId: 'user-123',
          type: 'session' as const,
          title: 'High 1',
          description: 'Test',
          reasoning: 'Test',
          confidence: 0.9,
          priority: 'high' as const,
          actionType: 'start_session' as const,
          expiresAt: now + 60 * 60 * 1000,
        },
        {
          id: 'rec-3',
          userId: 'user-123',
          type: 'session' as const,
          title: 'High 2',
          description: 'Test',
          reasoning: 'Test',
          confidence: 0.9,
          priority: 'high' as const,
          actionType: 'start_session' as const,
          expiresAt: now + 60 * 60 * 1000,
        },
        {
          id: 'rec-4',
          userId: 'user-123',
          type: 'session' as const,
          title: 'Low',
          description: 'Test',
          reasoning: 'Test',
          confidence: 0.9,
          priority: 'low' as const,
          actionType: 'start_session' as const,
          expiresAt: now + 60 * 60 * 1000,
        },
      ];

      const batched = batchProcessRecommendations(recommendations);

      expect(batched.critical.length).toBe(1);
      expect(batched.high.length).toBe(2);
      expect(batched.medium.length).toBe(0);
      expect(batched.low.length).toBe(1);
    });
  });
});
