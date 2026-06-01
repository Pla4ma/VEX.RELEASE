/**
 * Streaks Comprehensive Tests — Risk Helpers
 * Split from streaks-comprehensive.test.ts
 */
import { describe, it, expect } from '@jest/globals';

import {
  analyzePattern,
  calculateRecentQuality,
  getRiskLevel,
  getUrgency,
  getSuggestedAction,
} from '../utils/riskHelpers';

import { CRITICAL_THRESHOLD, HIGH_THRESHOLD, MEDIUM_THRESHOLD } from '../utils/riskTypes';

describe('Risk Helpers', () => {
  describe('analyzePattern', () => {
    it('returns CONSISTENT for < 5 sessions', () => {
      expect(analyzePattern([
        { timestamp: 1, quality: 80 },
        { timestamp: 2, quality: 80 },
      ])).toBe('CONSISTENT');
    });

    it('returns CONSISTENT for stable pattern', () => {
      const sessions = Array.from({ length: 10 }, (_, i) => ({
        timestamp: i * 86400000,
        quality: 80,
      }));
      expect(analyzePattern(sessions)).toBe('CONSISTENT');
    });

    it('returns DECLINING for increasing gaps', () => {
      const sessions = [
        { timestamp: 0, quality: 80 },
        { timestamp: 86400000, quality: 80 },
        { timestamp: 86400000 * 3, quality: 80 },
        { timestamp: 86400000 * 6, quality: 80 },
        { timestamp: 86400000 * 10, quality: 80 },
        { timestamp: 86400000 * 15, quality: 80 },
        { timestamp: 86400000 * 21, quality: 80 },
      ];
      expect(analyzePattern(sessions)).toBe('DECLINING');
    });

    it('handles empty array', () => {
      expect(analyzePattern([])).toBe('CONSISTENT');
    });
  });

  describe('calculateRecentQuality', () => {
    it('returns 100 for empty history', () => {
      expect(calculateRecentQuality([])).toBe(100);
    });

    it('calculates average of recent sessions', () => {
      const sessions = [
        { timestamp: 1, quality: 80 },
        { timestamp: 2, quality: 90 },
        { timestamp: 3, quality: 70 },
      ];
      expect(calculateRecentQuality(sessions)).toBe(80);
    });

    it('uses only last 5 sessions', () => {
      const sessions = Array.from({ length: 10 }, (_, i) => ({
        timestamp: i,
        quality: i < 5 ? 50 : 100,
      }));
      // Should average only the last 5 (all 100)
      expect(calculateRecentQuality(sessions)).toBe(100);
    });
  });

  describe('getRiskLevel', () => {
    it('returns CRITICAL for high hours or score', () => {
      expect(getRiskLevel(90, 5)).toBe('CRITICAL');
      expect(getRiskLevel(10, CRITICAL_THRESHOLD)).toBe('CRITICAL');
    });

    it('returns HIGH for medium-high score/hours', () => {
      expect(getRiskLevel(70, 5)).toBe('HIGH');
      expect(getRiskLevel(10, HIGH_THRESHOLD)).toBe('HIGH');
    });

    it('returns MEDIUM', () => {
      expect(getRiskLevel(45, 5)).toBe('MEDIUM');
      expect(getRiskLevel(10, MEDIUM_THRESHOLD)).toBe('MEDIUM');
    });

    it('returns LOW for score >= 20', () => {
      expect(getRiskLevel(25, 1)).toBe('LOW');
    });

    it('returns NONE for low score and hours', () => {
      expect(getRiskLevel(5, 1)).toBe('NONE');
    });
  });

  describe('getUrgency', () => {
    it('returns CRITICAL for CRITICAL level', () => {
      expect(getUrgency('CRITICAL', 25, 0)).toBe('CRITICAL');
    });

    it('returns URGENT for HIGH level', () => {
      expect(getUrgency('HIGH', 15, 1)).toBe('URGENT');
    });

    it('returns URGENT for MEDIUM with >18h', () => {
      expect(getUrgency('MEDIUM', 19, 1)).toBe('URGENT');
    });

    it('returns SOON for MEDIUM with <=18h', () => {
      expect(getUrgency('MEDIUM', 10, 1)).toBe('SOON');
    });

    it('returns SOON for LOW with daysUntilBreak <= 1', () => {
      expect(getUrgency('LOW', 5, 1)).toBe('SOON');
    });

    it('returns NONE for LOW with more days', () => {
      expect(getUrgency('LOW', 5, 3)).toBe('NONE');
    });
  });

  describe('getSuggestedAction', () => {
    it('returns INTERVENTION for CRITICAL', () => {
      expect(getSuggestedAction('CRITICAL', 'CRITICAL')).toBe('INTERVENTION');
    });

    it('returns PUSH for HIGH', () => {
      expect(getSuggestedAction('HIGH', 'URGENT')).toBe('PUSH');
    });

    it('returns PUSH for MEDIUM with URGENT urgency', () => {
      expect(getSuggestedAction('MEDIUM', 'URGENT')).toBe('PUSH');
    });

    it('returns REMINDER for MEDIUM', () => {
      expect(getSuggestedAction('MEDIUM', 'SOON')).toBe('REMINDER');
    });

    it('returns REMINDER for LOW', () => {
      expect(getSuggestedAction('LOW', 'NONE')).toBe('REMINDER');
    });

    it('returns NONE for NONE', () => {
      expect(getSuggestedAction('NONE', 'NONE')).toBe('NONE');
    });
  });
});
