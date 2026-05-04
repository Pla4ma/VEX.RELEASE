import {
  calculateSimilarityScore,
  createRivalMatch,
  discoverPotentialRivals,
  getRivalLeaderboard,
  getRivalStatusMessage,
  RivalMatchSchema,
  shouldSuggestNewRival,
  updateRivalScores,
} from '../loop-service';

describe('Rival Loop Service', () => {
  describe('RivalMatchSchema', () => {
    it('validates valid rival match', () => {
      const validMatch = {
        id: 'match-1',
        userId: 'user-1',
        rivalId: 'user-2',
        status: 'active',
        startedAt: Date.now(),
        endedAt: null,
        userScore: 100,
        rivalScore: 80,
        winStreak: 2,
        lossStreak: 0,
        lastSessionAt: Date.now(),
        comparisonMetric: 'xp',
      };

      expect(RivalMatchSchema.parse(validMatch)).toEqual(validMatch);
    });

    it('rejects invalid status', () => {
      expect(() =>
        RivalMatchSchema.parse({
          id: 'match-1',
          userId: 'user-1',
          rivalId: 'user-2',
          status: 'invalid',
          startedAt: Date.now(),
          endedAt: null,
          userScore: 0,
          rivalScore: 0,
          winStreak: 0,
          lossStreak: 0,
          lastSessionAt: null,
          comparisonMetric: 'xp',
        })
      ).toThrow();
    });
  });

  describe('discoverPotentialRivals', () => {
    it('discovers potential rivals', async () => {
      const rivals = await discoverPotentialRivals('user-1');

      expect(rivals.length).toBeGreaterThan(0);
      expect(rivals[0]).toHaveProperty('userId');
      expect(rivals[0]).toHaveProperty('similarityScore');
      expect(rivals[0]).toHaveProperty('stats');
      expect(rivals[0]).toHaveProperty('reason');
    });

    it('respects limit option', async () => {
      const rivals = await discoverPotentialRivals('user-1', { limit: 2 });

      expect(rivals.length).toBeLessThanOrEqual(2);
    });
  });

  describe('calculateSimilarityScore', () => {
    it('returns 1.0 for identical stats', () => {
      const stats = { xp: 1000, sessions: 50, focusTime: 1000 };

      expect(calculateSimilarityScore(stats, stats)).toBe(1);
    });

    it('returns lower score for different stats', () => {
      const user1 = { xp: 1000, sessions: 50, focusTime: 1000 };
      const user2 = { xp: 3000, sessions: 150, focusTime: 3000 };

      const score = calculateSimilarityScore(user1, user2);

      expect(score).toBeLessThan(1);
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('createRivalMatch', () => {
    it('creates active rival match', async () => {
      const match = await createRivalMatch('user-1', 'user-2', 'xp');

      expect(match.userId).toBe('user-1');
      expect(match.rivalId).toBe('user-2');
      expect(match.status).toBe('active');
      expect(match.comparisonMetric).toBe('xp');
      expect(match.userScore).toBe(0);
      expect(match.rivalScore).toBe(0);
    });
  });

  describe('updateRivalScores', () => {
    it('updates scores and win streak on user win', () => {
      const match = {
        id: 'match-1',
        userId: 'user-1',
        rivalId: 'user-2',
        status: 'active' as const,
        startedAt: Date.now(),
        endedAt: null,
        userScore: 100,
        rivalScore: 80,
        winStreak: 1,
        lossStreak: 0,
        lastSessionAt: null,
        comparisonMetric: 'xp' as const,
      };

      const updated = updateRivalScores(match, 50, 30);

      expect(updated.userScore).toBe(150);
      expect(updated.rivalScore).toBe(110);
      expect(updated.winStreak).toBe(2);
      expect(updated.lossStreak).toBe(0);
    });

    it('updates loss streak on rival win', () => {
      const match = {
        id: 'match-1',
        userId: 'user-1',
        rivalId: 'user-2',
        status: 'active' as const,
        startedAt: Date.now(),
        endedAt: null,
        userScore: 100,
        rivalScore: 120,
        winStreak: 0,
        lossStreak: 2,
        lastSessionAt: null,
        comparisonMetric: 'xp' as const,
      };

      const updated = updateRivalScores(match, 20, 50);

      expect(updated.winStreak).toBe(0);
      expect(updated.lossStreak).toBe(3);
    });
  });

  describe('getRivalStatusMessage', () => {
    it('returns ahead message when leading', () => {
      const match = {
        id: 'match-1',
        userId: 'user-1',
        rivalId: 'user-2',
        status: 'active' as const,
        startedAt: Date.now(),
        endedAt: null,
        userScore: 300,
        rivalScore: 150,
        winStreak: 0,
        lossStreak: 0,
        lastSessionAt: null,
        comparisonMetric: 'xp' as const,
      };

      expect(getRivalStatusMessage(match)).toContain('ahead');
    });

    it('returns trailing message when behind', () => {
      const match = {
        id: 'match-1',
        userId: 'user-1',
        rivalId: 'user-2',
        status: 'active' as const,
        startedAt: Date.now(),
        endedAt: null,
        userScore: 100,
        rivalScore: 250,
        winStreak: 0,
        lossStreak: 0,
        lastSessionAt: null,
        comparisonMetric: 'xp' as const,
      };

      expect(getRivalStatusMessage(match)).toContain('Trailing');
    });

    it('returns win streak message', () => {
      const match = {
        id: 'match-1',
        userId: 'user-1',
        rivalId: 'user-2',
        status: 'active' as const,
        startedAt: Date.now(),
        endedAt: null,
        userScore: 150,
        rivalScore: 140,
        winStreak: 3,
        lossStreak: 0,
        lastSessionAt: null,
        comparisonMetric: 'xp' as const,
      };

      expect(getRivalStatusMessage(match)).toContain('wins in a row');
    });
  });

  describe('shouldSuggestNewRival', () => {
    it('returns true when few matches and recent suggestion', () => {
      const recentSuggestion = Date.now() - 25 * 60 * 60 * 1000; // 25 hours ago
      const matches = [{ status: 'active' } as const];

      expect(shouldSuggestNewRival(matches as any, recentSuggestion)).toBe(true);
    });

    it('returns false when too many active rivals', () => {
      const oldSuggestion = Date.now() - 48 * 60 * 60 * 1000;
      const matches = [
        { status: 'active' },
        { status: 'active' },
        { status: 'active' },
      ] as any;

      expect(shouldSuggestNewRival(matches, oldSuggestion)).toBe(false);
    });

    it('returns false when recently suggested', () => {
      const recentSuggestion = Date.now() - 12 * 60 * 60 * 1000; // 12 hours ago
      const matches = [{ status: 'active' }] as any;

      expect(shouldSuggestNewRival(matches, recentSuggestion)).toBe(false);
    });
  });

  describe('getRivalLeaderboard', () => {
    it('returns leaderboard data', async () => {
      const leaderboard = await getRivalLeaderboard('match-1');

      expect(leaderboard).toHaveProperty('userRank');
      expect(leaderboard).toHaveProperty('rivalRank');
      expect(leaderboard).toHaveProperty('percentile');
    });
  });
});
