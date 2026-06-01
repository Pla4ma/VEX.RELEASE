/**
 * Base Score Calculator Tests
 */

import {
  calculateBaseScore,
  calculateBaseScoreFromSession,
  validateScoringInput,
  SCORING_CONSTANTS,
} from '../BaseScoreCalculator';
import type { SessionState } from '../../../types';

describe('BaseScoreCalculator', () => {
  describe('calculateBaseScore', () => {
    it('should calculate base score for completed session', () => {
      const result = calculateBaseScore({
        durationSeconds: 1500, // 25 minutes
        completionPercentage: 100,
        effectiveTimeSeconds: 1500,
      });

      expect(result.basePoints).toBeGreaterThan(0);
      expect(result.meetsMinimumCompletion).toBe(true);
      expect(result.completionMultiplier).toBe(1.0);
    });

    it('should return 0 for sessions below minimum completion', () => {
      const result = calculateBaseScore({
        durationSeconds: 1500,
        completionPercentage: 40, // Below 50% threshold
        effectiveTimeSeconds: 600,
      });

      expect(result.basePoints).toBe(0);
      expect(result.meetsMinimumCompletion).toBe(false);
    });

    it('should apply completion multiplier', () => {
      const fullResult = calculateBaseScore({
        durationSeconds: 1500,
        completionPercentage: 100,
        effectiveTimeSeconds: 1500,
      });

      const partialResult = calculateBaseScore({
        durationSeconds: 1500,
        completionPercentage: 75,
        effectiveTimeSeconds: 1125,
      });

      expect(fullResult.basePoints).toBeGreaterThan(partialResult.basePoints);
      expect(fullResult.completionMultiplier).toBe(1.0);
      expect(partialResult.completionMultiplier).toBe(0.75);
    });

    it('should cap at maximum base score', () => {
      const result = calculateBaseScore({
        durationSeconds: 100000, // Very long session
        completionPercentage: 100,
        effectiveTimeSeconds: 100000,
      });

      expect(result.capped).toBe(true);
      expect(result.basePoints).toBe(SCORING_CONSTANTS.MAX_BASE_SCORE);
    });

    it('should calculate correct duration points', () => {
      const result = calculateBaseScore({
        durationSeconds: 600, // 10 minutes
        completionPercentage: 100,
        effectiveTimeSeconds: 600,
      });

      expect(result.durationPoints).toBe(100); // 10 minutes * 10 points
    });
  });

  describe('calculateBaseScoreFromSession', () => {
    it('should extract values from session state', () => {
      const session: Partial<SessionState> = {
        config: { duration: 1800 } as any,
        completionPercentage: 90,
        effectiveTime: 1620,
      };

      const result = calculateBaseScoreFromSession(session as SessionState);

      expect(result.basePoints).toBeGreaterThan(0);
      expect(result.meetsMinimumCompletion).toBe(true);
    });
  });

  describe('validateScoringInput', () => {
    it('should validate valid input', () => {
      const result = validateScoringInput({
        durationSeconds: 1500,
        completionPercentage: 100,
        effectiveTimeSeconds: 1500,
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject negative duration', () => {
      const result = validateScoringInput({
        durationSeconds: -100,
        completionPercentage: 100,
        effectiveTimeSeconds: 100,
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Duration cannot be negative');
    });

    it('should reject duration exceeding max', () => {
      const result = validateScoringInput({
        durationSeconds: 30000, // > 8 hours
        completionPercentage: 100,
        effectiveTimeSeconds: 30000,
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Duration exceeds maximum (8 hours)');
    });

    it('should reject invalid completion percentage', () => {
      const result = validateScoringInput({
        durationSeconds: 1500,
        completionPercentage: 150, // > 100%
        effectiveTimeSeconds: 1500,
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Completion percentage must be between 0 and 100',
      );
    });

    it('should reject negative effective time', () => {
      const result = validateScoringInput({
        durationSeconds: 1500,
        completionPercentage: 100,
        effectiveTimeSeconds: -100,
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Effective time cannot be negative');
    });
  });
});
