/**
 * Deep Streaks Tests — milestones edge cases
 */

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('../../../events', () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));
jest.mock('../../../events/EventBus', () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));
jest.mock('../../../utils/debug', () => ({
  createDebugger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
  }),
}));
jest.mock('../../../utils/silent-failure', () => ({
  captureSilentFailure: jest.fn(),
}));
jest.mock('../../../utils/uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-1234'),
}));
jest.mock('../../../persistence/MMKVStorageAdapter', () => ({
  MMKVStorageAdapter: jest.fn().mockImplementation(() => ({
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  })),
}));
jest.mock('../repository', () => ({
  fetchStreak: jest.fn(),
  createStreak: jest.fn(),
  updateStreak: jest.fn(),
  recordShieldEarned: jest.fn(),
  recordShieldUsed: jest.fn(),
  getAvailableShield: jest.fn(),
}));
jest.mock('../restore-quest', () => ({
  hasUsedStreakRestoreThisMonth: jest.fn(() => Promise.resolve(false)),
}));
jest.mock('../repository-helpers', () => ({
  RepositoryError: class RepositoryError extends Error {},
}));

// ── Imports ────────────────────────────────────────────────────────────────

import {
  checkMilestones,
  getNextMilestone,
  getMilestoneProgress,
  getStreakDisplayText,
  getStreakCelebrationMessage,
} from '../milestones';

// ============================================================================
// milestones edge cases
// ============================================================================

describe('milestones edge cases', () => {
  describe('checkMilestones', () => {
    it('returns empty for non-milestone days', () => {
      expect(checkMilestones(4)).toHaveLength(0);
      expect(checkMilestones(10)).toHaveLength(0);
    });

    it('returns milestone for day 7', () => {
      const result = checkMilestones(7);
      expect(result).toHaveLength(1);
      expect(result[0]!.days).toBe(7);
    });

    it('returns milestone for day 30', () => {
      const result = checkMilestones(30);
      expect(result).toHaveLength(1);
    });
  });

  describe('getNextMilestone', () => {
    it('returns first milestone for day 0', () => {
      const next = getNextMilestone(0);
      expect(next).not.toBeNull();
      expect(next!.days).toBe(3);
    });

    it('returns null when all milestones passed', () => {
      const next = getNextMilestone(400);
      expect(next).toBeNull();
    });
  });

  describe('getMilestoneProgress', () => {
    it('returns 100% at exact milestone', () => {
      const result = getMilestoneProgress(7);
      expect(result.percentComplete).toBe(100);
      expect(result.nextMilestone).not.toBeNull();
    });

    it('returns 100% when past all milestones', () => {
      const result = getMilestoneProgress(400);
      expect(result.percentComplete).toBe(100);
      expect(result.nextMilestone).toBeNull();
    });

    it('calculates correct percentage between milestones', () => {
      const result = getMilestoneProgress(5);
      // next milestone is 7
      expect(result.percentComplete).toBeGreaterThan(0);
      expect(result.percentComplete).toBeLessThan(100);
    });
  });

  describe('getStreakDisplayText', () => {
    it('singular for 1 day', () => {
      expect(getStreakDisplayText(1)).toBe('1 Day');
    });

    it('plural for multiple days', () => {
      expect(getStreakDisplayText(5)).toBe('5 Days');
    });

    it('handles zero', () => {
      expect(getStreakDisplayText(0)).toBe('0 Days');
    });
  });

  describe('getStreakCelebrationMessage', () => {
    it('returns special message for day 1', () => {
      expect(getStreakCelebrationMessage(1)).toContain('Day 1');
    });

    it('returns special message for day 7', () => {
      expect(getStreakCelebrationMessage(7)).toContain('Week Warrior');
    });

    it('returns special message for day 100', () => {
      expect(getStreakCelebrationMessage(100)).toContain('Century Club');
    });

    it('returns generic message for non-milestone days', () => {
      expect(getStreakCelebrationMessage(5)).toContain('5 days');
    });
  });
});
