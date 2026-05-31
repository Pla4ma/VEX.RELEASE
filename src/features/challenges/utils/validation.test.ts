/**
 * Challenge Validation Tests
 *
 * @phase 11 - Deepening: Validation tests
 */

import {
  validateChallengeCompletion,
  analyzeChallengeBalance,
  ChallengeCompletionSchema,
  ChallengeDifficultySchema,
} from './validation';

describe('Challenge Validation', () => {
  describe('validateChallengeCompletion', () => {
    it('should validate normal completion', () => {
      const result = validateChallengeCompletion(
        {
          challengeId: 'challenge-1',
          userId: 'user-1',
          completedAt: Date.now(),
          timeSpent: 300,
          attempts: 1,
          score: 100,
        },
        {
          id: 'challenge-1',
          difficulty: 'MEDIUM',
          expectedDuration: 300,
          minDuration: 60,
          maxDuration: 600,
        },
        { previousCompletions: [], avgTimeForDifficulty: 300 },
      );

      expect(result.valid).toBe(true);
    });

    it('should detect completion too fast', () => {
      const result = validateChallengeCompletion(
        {
          challengeId: 'challenge-1',
          userId: 'user-1',
          completedAt: Date.now(),
          timeSpent: 5,
          attempts: 1,
          score: 100,
        },
        {
          id: 'challenge-1',
          difficulty: 'HARD',
          expectedDuration: 300,
          minDuration: 60,
          maxDuration: 600,
        },
        { previousCompletions: [], avgTimeForDifficulty: 300 },
      );

      expect(result.suspicious).toBe(true);
    });

    it('should detect excessive attempts', () => {
      const result = validateChallengeCompletion(
        {
          challengeId: 'challenge-1',
          userId: 'user-1',
          completedAt: Date.now(),
          timeSpent: 300,
          attempts: 150,
          score: 100,
        },
        {
          id: 'challenge-1',
          difficulty: 'EASY',
          expectedDuration: 300,
          minDuration: 60,
          maxDuration: 600,
        },
        { previousCompletions: [], avgTimeForDifficulty: 300 },
      );

      expect(result.suspicious).toBe(true);
    });
  });

  describe('analyzeChallengeBalance', () => {
    it('should validate balanced challenge', () => {
      const result = analyzeChallengeBalance(
        {
          completionRate: 0.7,
          avgTimeSpent: 280,
          avgAttempts: 2.5,
          abandonmentRate: 0.1,
        },
        {
          targetCompletionRate: 0.65,
          targetTimeSpent: 300,
          maxAbandonmentRate: 0.2,
        },
      );

      expect(result.balanced).toBe(true);
    });

    it('should recommend adjustment for low success rate', () => {
      const result = analyzeChallengeBalance(
        {
          completionRate: 0.1,
          avgTimeSpent: 590,
          avgAttempts: 8,
          abandonmentRate: 0.5,
        },
        {
          targetCompletionRate: 0.65,
          targetTimeSpent: 300,
          maxAbandonmentRate: 0.2,
        },
      );

      expect(result.balanced).toBe(false);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('ChallengeCompletionSchema', () => {
    it('should validate valid completion', () => {
      const data = {
        challengeId: 'c1',
        userId: 'u1',
        completedAt: Date.now(),
        timeSpent: 120,
        attempts: 1,
        score: 100,
      };
      expect(ChallengeCompletionSchema.parse(data)).toEqual(data);
    });

    it('should reject negative timeSpent', () => {
      expect(() =>
        ChallengeCompletionSchema.parse({
          challengeId: 'c1',
          userId: 'u1',
          completedAt: Date.now(),
          timeSpent: -10,
          attempts: 1,
          score: 100,
        }),
      ).toThrow();
    });
  });

  describe('ChallengeDifficultySchema', () => {
    it('should validate valid difficulties', () => {
      expect(ChallengeDifficultySchema.parse('EASY')).toBe('EASY');
      expect(ChallengeDifficultySchema.parse('MEDIUM')).toBe('MEDIUM');
      expect(ChallengeDifficultySchema.parse('HARD')).toBe('HARD');
      expect(ChallengeDifficultySchema.parse('EXPERT')).toBe('EXPERT');
    });

    it('should reject invalid difficulty', () => {
      expect(() => ChallengeDifficultySchema.parse('IMPOSSIBLE')).toThrow();
    });
  });
});
