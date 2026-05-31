/**
 * Tests for Challenges — Validation
 */

import { describe, it, expect } from '@jest/globals';

import {
  validateChallengeCompletion,
  analyzeChallengeBalance,
  ChallengeDifficultySchema,
  ChallengeCompletionSchema,
} from '../utils/validation';

const NOW = Date.now();

describe('Validation', () => {
  describe('validateChallengeCompletion', () => {
    const baseChallenge = {
      id: 'c-1',
      difficulty: 'MEDIUM' as const,
      expectedDuration: 300,
      minDuration: 60,
      maxDuration: 600,
    };

    it('returns valid for normal completion', () => {
      const result = validateChallengeCompletion(
        { challengeId: 'c-1', userId: 'u-1', completedAt: NOW, timeSpent: 300, attempts: 1, score: 100 },
        baseChallenge,
        { previousCompletions: [], avgTimeForDifficulty: 300 },
      );
      expect(result.valid).toBe(true);
      expect(result.suspicious).toBe(false);
      expect(result.errors).toHaveLength(0);
    });

    it('flags suspicious when time is below minDuration', () => {
      const result = validateChallengeCompletion(
        { challengeId: 'c-1', userId: 'u-1', completedAt: NOW, timeSpent: 5, attempts: 1, score: 100 },
        baseChallenge,
        { previousCompletions: [], avgTimeForDifficulty: 300 },
      );
      expect(result.suspicious).toBe(true);
      expect(result.errors.some((e) => e.includes('too fast'))).toBe(true);
    });

    it('flags invalid when time exceeds maxDuration', () => {
      const result = validateChallengeCompletion(
        { challengeId: 'c-1', userId: 'u-1', completedAt: NOW, timeSpent: 700, attempts: 1, score: 100 },
        baseChallenge,
        { previousCompletions: [], avgTimeForDifficulty: 300 },
      );
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Exceeded'))).toBe(true);
    });

    it('flags suspicious for excessive attempts', () => {
      const result = validateChallengeCompletion(
        { challengeId: 'c-1', userId: 'u-1', completedAt: NOW, timeSpent: 300, attempts: 150, score: 100 },
        baseChallenge,
        { previousCompletions: [], avgTimeForDifficulty: 300 },
      );
      expect(result.suspicious).toBe(true);
    });

    it('detects duplicate completion', () => {
      const result = validateChallengeCompletion(
        { challengeId: 'c-1', userId: 'u-1', completedAt: NOW, timeSpent: 300, attempts: 1, score: 100 },
        baseChallenge,
        {
          previousCompletions: [
            { challengeId: 'c-1', userId: 'u-1', completedAt: NOW + 5000, timeSpent: 300, attempts: 1, score: 100 },
          ],
          avgTimeForDifficulty: 300,
        },
      );
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Duplicate'))).toBe(true);
    });

    it('flags when user is much faster than their average', () => {
      const result = validateChallengeCompletion(
        { challengeId: 'c-1', userId: 'u-1', completedAt: NOW, timeSpent: 30, attempts: 1, score: 100 },
        baseChallenge,
        { previousCompletions: [], avgTimeForDifficulty: 300 },
      );
      expect(result.suspicious).toBe(true);
    });
  });

  describe('ChallengeCompletionSchema', () => {
    it('validates a valid completion object', () => {
      const data = {
        challengeId: 'c1',
        userId: 'u1',
        completedAt: NOW,
        timeSpent: 120,
        attempts: 1,
        score: 100,
      };
      expect(ChallengeCompletionSchema.parse(data)).toEqual(data);
    });

    it('rejects negative timeSpent', () => {
      expect(() =>
        ChallengeCompletionSchema.parse({
          challengeId: 'c1', userId: 'u1', completedAt: NOW,
          timeSpent: -10, attempts: 1, score: 100,
        }),
      ).toThrow();
    });
  });

  describe('ChallengeDifficultySchema (validation)', () => {
    it('accepts all valid difficulties', () => {
      expect(ChallengeDifficultySchema.parse('EASY')).toBe('EASY');
      expect(ChallengeDifficultySchema.parse('EXPERT')).toBe('EXPERT');
    });

    it('rejects unknown difficulty', () => {
      expect(() => ChallengeDifficultySchema.parse('LEGENDARY')).toThrow();
    });
  });

  describe('analyzeChallengeBalance', () => {
    it('returns balanced for metrics within target', () => {
      const result = analyzeChallengeBalance(
        { completionRate: 0.65, avgTimeSpent: 300, avgAttempts: 3, abandonmentRate: 0.1 },
        { targetCompletionRate: 0.65, targetTimeSpent: 300, maxAbandonmentRate: 0.2 },
      );
      expect(result.balanced).toBe(true);
      expect(result.recommendations).toHaveLength(0);
      expect(result.difficultyAdjustment).toBe(0);
    });

    it('recommends increasing difficulty for too-easy challenge', () => {
      const result = analyzeChallengeBalance(
        { completionRate: 0.99, avgTimeSpent: 300, avgAttempts: 2, abandonmentRate: 0.05 },
        { targetCompletionRate: 0.65, targetTimeSpent: 300, maxAbandonmentRate: 0.2 },
      );
      expect(result.balanced).toBe(false);
      expect(result.difficultyAdjustment).toBeGreaterThan(0);
    });

    it('recommends decreasing difficulty for too-hard challenge', () => {
      const result = analyzeChallengeBalance(
        { completionRate: 0.1, avgTimeSpent: 600, avgAttempts: 8, abandonmentRate: 0.5 },
        { targetCompletionRate: 0.65, targetTimeSpent: 300, maxAbandonmentRate: 0.2 },
      );
      expect(result.balanced).toBe(false);
      expect(result.difficultyAdjustment).toBeLessThan(0);
    });

    it('flags high abandonment rate', () => {
      const result = analyzeChallengeBalance(
        { completionRate: 0.65, avgTimeSpent: 300, avgAttempts: 3, abandonmentRate: 0.5 },
        { targetCompletionRate: 0.65, targetTimeSpent: 300, maxAbandonmentRate: 0.2 },
      );
      expect(result.balanced).toBe(false);
      expect(result.recommendations.some((r) => r.includes('abandonment'))).toBe(true);
    });

    it('notes high retry count', () => {
      const result = analyzeChallengeBalance(
        { completionRate: 0.65, avgTimeSpent: 300, avgAttempts: 15, abandonmentRate: 0.1 },
        { targetCompletionRate: 0.65, targetTimeSpent: 300, maxAbandonmentRate: 0.2 },
      );
      expect(result.recommendations.some((r) => r.includes('retry'))).toBe(true);
    });
  });
});
