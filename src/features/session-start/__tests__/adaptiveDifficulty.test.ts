/**
 * Adaptive Difficulty Service Tests
 */

import { getAdaptiveDifficultySuggestion, shouldShowSuggestion } from '../service/adaptiveDifficulty';
import type { SessionData } from '../service/adaptiveDifficulty';

describe('adaptiveDifficulty', () => {
  describe('getAdaptiveDifficultySuggestion', () => {
    const mockSessions: SessionData[] = [
      { id: '1', grade: 'S', purityScore: 95, duration: 1800, createdAt: '2025-01-01' },
      { id: '2', grade: 'S', purityScore: 92, duration: 1800, createdAt: '2025-01-02' },
      { id: '3', grade: 'S', purityScore: 96, duration: 1800, createdAt: '2025-01-03' },
      { id: '4', grade: 'S', purityScore: 94, duration: 1800, createdAt: '2025-01-04' },
      { id: '5', grade: 'S', purityScore: 93, duration: 1800, createdAt: '2025-01-05' },
    ];

    it('returns suggestion to upgrade from CASUAL when all S grades', () => {
      const result = getAdaptiveDifficultySuggestion(mockSessions, 'CASUAL');

      expect(result.suggestion).toBe('FOCUSED');
      expect(result.confidence).toBe('high');
      expect(result.reason).toContain('Ready for FOCUSED');
      expect(result.stats.sessionsAnalyzed).toBe(5);
      expect(result.stats.averageGrade).toBeCloseTo(5, 1);
    });

    it('returns suggestion to downgrade from FOCUSED when low grades', () => {
      const lowSessions: SessionData[] = [
        { id: '1', grade: 'C', purityScore: 55, duration: 1800 },
        { id: '2', grade: 'D', purityScore: 45, duration: 1800 },
        { id: '3', grade: 'C', purityScore: 50, duration: 1800 },
        { id: '4', grade: 'C', purityScore: 58, duration: 1800 },
        { id: '5', grade: 'D', purityScore: 48, duration: 1800 },
      ];

      const result = getAdaptiveDifficultySuggestion(lowSessions, 'FOCUSED');

      expect(result.suggestion).toBe('CASUAL');
      expect(result.confidence).toBe('high');
      expect(result.reason).toContain('Drop to CASUAL');
    });

    it('returns null suggestion when not enough sessions', () => {
      const fewSessions: SessionData[] = [
        { id: '1', grade: 'S', purityScore: 95 },
        { id: '2', grade: 'S', purityScore: 92 },
      ];

      const result = getAdaptiveDifficultySuggestion(fewSessions, 'CASUAL');

      expect(result.suggestion).toBeNull();
      expect(result.confidence).toBe('low');
      expect(result.reason).toContain('3 more sessions');
    });

    it('returns no suggestion for INTENSE difficulty', () => {
      const result = getAdaptiveDifficultySuggestion(mockSessions, 'INTENSE');

      expect(result.suggestion).toBeNull();
      expect(result.reason).not.toContain('suggest');
    });

    it('suggests upgrade from FOCUSED to INTENSE for high performers', () => {
      const result = getAdaptiveDifficultySuggestion(mockSessions, 'FOCUSED');

      expect(result.suggestion).toBe('INTENSE');
      expect(result.confidence).toBe('medium');
      expect(result.reason).toContain('mastered FOCUSED');
    });

    it('calculates average grade correctly', () => {
      const mixedSessions: SessionData[] = [
        { id: '1', grade: 'A', purityScore: 88 },
        { id: '2', grade: 'B', purityScore: 82 },
        { id: '3', grade: 'A', purityScore: 90 },
        { id: '4', grade: 'B', purityScore: 85 },
        { id: '5', grade: 'A', purityScore: 87 },
      ];

      const result = getAdaptiveDifficultySuggestion(mixedSessions, 'CASUAL');

      expect(result.stats.averageGrade).toBeCloseTo(3.6, 1); // A=4, B=3
      expect(result.stats.averagePurity).toBeCloseTo(86.4, 1);
    });

    it('filters out sessions without grades', () => {
      const mixedSessions: SessionData[] = [
        { id: '1', grade: 'S', purityScore: 95 },
        { id: '2', purityScore: 90 }, // No grade
        { id: '3', grade: 'S', purityScore: 92 },
        { id: '4', purityScore: 88 }, // No grade
        { id: '5', grade: 'S', purityScore: 94 },
        { id: '6', grade: 'A', purityScore: 88 },
        { id: '7', grade: 'A', purityScore: 87 },
      ];

      const result = getAdaptiveDifficultySuggestion(mixedSessions, 'CASUAL');

      expect(result.stats.sessionsAnalyzed).toBe(5);
    });
  });

  describe('shouldShowSuggestion', () => {
    it('returns true when no lastShownAt', () => {
      expect(shouldShowSuggestion(null)).toBe(true);
      expect(shouldShowSuggestion(undefined as unknown as null)).toBe(true);
    });

    it('returns false when shown recently', () => {
      const recent = Date.now() - 1000 * 60 * 60; // 1 hour ago
      expect(shouldShowSuggestion(recent)).toBe(false);
    });

    it('returns true when shown over 24 hours ago', () => {
      const old = Date.now() - 1000 * 60 * 60 * 25; // 25 hours ago
      expect(shouldShowSuggestion(old)).toBe(true);
    });

    it('respects custom interval', () => {
      const sixHoursAgo = Date.now() - 1000 * 60 * 60 * 6;

      expect(shouldShowSuggestion(sixHoursAgo, 1000 * 60 * 60 * 4)).toBe(true);
      expect(shouldShowSuggestion(sixHoursAgo, 1000 * 60 * 60 * 8)).toBe(false);
    });
  });
});
