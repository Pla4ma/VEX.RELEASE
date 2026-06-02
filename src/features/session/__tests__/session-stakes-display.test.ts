import { describe, it, expect } from '@jest/globals';
import { calculateStakesResult } from '../session-stakes';

describe('Session Stakes - Quality & Display', () => {
  describe('Quality Score Based on Pauses', () => {
    it('should give 100 quality with no pauses', () => {
      const result = calculateStakesResult(
        'session-1',
        'user-1',
        'FOCUSED',
        true,
        100,
        0,
        30 * 60,
        0,
      );
      expect(result.qualityScore).toBe(100);
    });
    it('should penalize pauses according to difficulty', () => {
      const casualResult = calculateStakesResult(
        'session-1',
        'user-1',
        'CASUAL',
        true,
        100,
        2,
        30 * 60,
        0,
      );
      expect(casualResult.qualityScore).toBe(80);
      const focusedResult = calculateStakesResult(
        'session-1',
        'user-1',
        'FOCUSED',
        true,
        100,
        2,
        30 * 60,
        0,
      );
      expect(focusedResult.qualityScore).toBe(50);
    });
    it('should cap quality penalty at 50%', () => {
      const result = calculateStakesResult(
        'session-1',
        'user-1',
        'FOCUSED',
        true,
        100,
        10,
        30 * 60,
        0,
      );
      expect(result.qualityScore).toBeGreaterThanOrEqual(0);
    });
  });
  describe('UI Display Helpers', () => {
    it('should return correct display for CASUAL', () => {
      const { label, description, icon, color, riskLevel } =
        require('../session-stakes').getDifficultyDisplay('CASUAL');
      expect(label).toBe('Casual');
      expect(icon).toBe('');
      expect(color).toBe('#4caf50');
      expect(riskLevel).toBe('LOW');
    });
    it('should return correct display for FOCUSED', () => {
      const { label, description, icon, color, riskLevel } =
        require('../session-stakes').getDifficultyDisplay('FOCUSED');
      expect(label).toBe('Focused');
      expect(icon).toBe('');
      expect(color).toBe('#ff9800');
      expect(riskLevel).toBe('MEDIUM');
    });
    it('should return correct display for DEEP_WORK', () => {
      const { label, description, icon, color, riskLevel } =
        require('../session-stakes').getDifficultyDisplay('DEEP_WORK');
      expect(label).toBe('Deep Work');
      expect(icon).toBe('');
      expect(color).toBe('#9c27b0');
      expect(riskLevel).toBe('HIGH');
    });
  });
});
