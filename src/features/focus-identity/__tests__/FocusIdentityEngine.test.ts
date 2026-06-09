import {
  FocusIdentityEngine,
} from '../FocusIdentityEngine';
import {
  calculateConsistencyFactorForInput,
  calculateStreakStabilityFactorForInput,
} from '../habit-calculators';
import { calculateSessionQualityFactorForInput } from '../session-factors';

describe('FocusIdentityEngine', () => {
  let engine: FocusIdentityEngine;
  beforeEach(() => {
    engine = new FocusIdentityEngine();
  });
  describe('Score Band Determination', () => {
    it('should return correct band for Legendary score (800-850)', () => {
      const band = engine.getScoreBand(820);
      expect(band.label).toBe('Legendary');
      expect(band.title).toBe('Focus Virtuoso');
      expect(band.percentile).toBe(99);
    });
    it('should return correct band for Elite score (740-799)', () => {
      const band = engine.getScoreBand(760);
      expect(band.label).toBe('Elite');
      expect(band.title).toBe('Elite Performer');
    });
    it('should return correct band for Building score (300-419)', () => {
      const band = engine.getScoreBand(350);
      expect(band.label).toBe('Building');
      expect(band.title).toBe('Building Habits');
    });
    it('should return bottom band for minimum score (300)', () => {
      const band = engine.getScoreBand(300);
      expect(band.label).toBe('Building');
    });
    it('should return top band for maximum score (850)', () => {
      const band = engine.getScoreBand(850);
      expect(band.label).toBe('Legendary');
    });
  });
  describe('Consistency Factor Calculation', () => {
    it('should give high score for perfect consistency', () => {
      const result = calculateConsistencyFactorForInput(16, 4, 0);
      expect(result.score).toBeGreaterThan(90);
      expect(result.actualConsistency).toBe(1);
    });
    it('should penalize missed days heavily', () => {
      const result = calculateConsistencyFactorForInput(12, 4, 5);
      expect(result.score).toBeLessThan(70);
      expect(result.missedDaysLast30Days).toBe(5);
    });
    it('should handle zero sessions', () => {
      const result = calculateConsistencyFactorForInput(0, 4, 30);
      expect(result.score).toBeLessThan(20);
      expect(result.actualConsistency).toBe(0);
    });
  });
  describe('Streak Stability Factor', () => {
    it('should reward long current streak', () => {
      const result = calculateStreakStabilityFactorForInput(45, 60, [
        { start: 0, end: 1000, length: 30 },
      ]);
      expect(result.score).toBeGreaterThan(70);
    });
    it('should penalize frequent breaks', () => {
      const result = calculateStreakStabilityFactorForInput(5, 10, [
        { start: 0, end: Date.now() - 86400000 * 10, length: 5 },
        { start: 0, end: Date.now() - 86400000 * 20, length: 3 },
        { start: 0, end: Date.now() - 86400000 * 30, length: 4 },
        { start: 0, end: Date.now() - 86400000 * 40, length: 2 },
      ]);
      expect(result.score).toBeLessThan(60);
      expect(result.streakBreakFrequency).toBeGreaterThan(0);
    });
  });
  describe('Session Quality Factor', () => {
    it('should score perfect sessions highly', () => {
      const result = calculateSessionQualityFactorForInput([
        { focusPurity: 98, grade: 'S', duration: 50, wasAbandoned: false },
        { focusPurity: 95, grade: 'S', duration: 45, wasAbandoned: false },
      ]);
      expect(result.score).toBeGreaterThanOrEqual(85);
      expect(result.averageGrade).toBe('S');
      expect(result.perfectSessionsCount).toBe(2);
    });
    it('should penalize abandoned sessions', () => {
      const result = calculateSessionQualityFactorForInput([
        { focusPurity: 98, grade: 'S', duration: 50, wasAbandoned: false },
        { focusPurity: 30, grade: 'D', duration: 5, wasAbandoned: true },
      ]);
      expect(result.averageFocusPurity).toBe(98);
    });
  });
  describe('Score Change Calculation', () => {
    it('should add points for session complete', () => {
      const change = engine.calculateScoreChange('SESSION_COMPLETE', {
        streakLength: 5,
        sessionGrade: 'A',
      });
      expect(change).toBeGreaterThan(5);
    });
    it('should subtract points for missed day', () => {
      const change = engine.calculateScoreChange('MISSED_DAY', {});
      expect(change).toBeLessThan(0);
    });
    it('should apply streak bonus for positive events', () => {
      const withStreak = engine.calculateScoreChange('SESSION_COMPLETE', {
        streakLength: 20,
      });
      const withoutStreak = engine.calculateScoreChange('SESSION_COMPLETE', {
        streakLength: 1,
      });
      expect(withStreak).toBeGreaterThan(withoutStreak);
    });
    it('should apply recovery multiplier', () => {
      const normal = engine.calculateScoreChange('SESSION_COMPLETE', {
        isInRecovery: false,
      });
      const recovery = engine.calculateScoreChange('SESSION_COMPLETE', {
        isInRecovery: true,
      });
      expect(recovery).toBeGreaterThan(normal);
    });
  });
  describe('Identity Statements', () => {
    it('should return appropriate statement for band', () => {
      const statement = engine.getIdentityStatement('Legendary', 0);
      expect(statement).toContain('Virtuoso');
    });
    it('should rotate statements based on streak in band', () => {
      const week1 = engine.getIdentityStatement('Elite', 5);
      const week3 = engine.getIdentityStatement('Elite', 21);
      expect(week1).not.toBe(week3);
    });
  });
  describe('Composite Score Calculation', () => {
    it('should calculate composite score from factors', async () => {
      const result = await engine.calculateFocusScore({
        sessionsLast30Days: 20,
        targetSessionsPerWeek: 4,
        missedDaysLast30Days: 2,
        currentStreak: 15,
        longestStreak: 30,
        streakHistory: [],
        sessionDetails: [],
        daysSinceLastSession: 0,
        last7DaySessions: 5,
        last30DaySessions: 20,
        scoreHistory: [],
      });
      expect(result.score).toBeGreaterThanOrEqual(300);
      expect(result.score).toBeLessThanOrEqual(850);
      expect(result.factors.consistency.score).toBeGreaterThan(0);
      expect(result.factors.streakStability.score).toBeGreaterThan(0);
    });
  });
});
