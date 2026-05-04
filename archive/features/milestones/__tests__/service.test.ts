/**
 * Milestones Service Tests
 */

import {
  checkMilestone,
  getMilestonesByType,
  getMilestoneProgress,
  buildMilestoneTimeline,
  getUnlocksForLevel,
  checkUnlockStatus,
  evaluateMilestones,
} from '../service';

describe('MilestonesService', () => {
  describe('checkMilestone', () => {
    it('should return completed when threshold met', () => {
      const result = checkMilestone({
        userId: 'user-1',
        milestoneId: 'level-5',
        currentValue: 5,
      });
      expect(result.completed).toBe(true);
      expect(result.progress.percentComplete).toBe(100);
    });

    it('should return not completed when below threshold', () => {
      const result = checkMilestone({
        userId: 'user-1',
        milestoneId: 'level-5',
        currentValue: 3,
      });
      expect(result.completed).toBe(false);
      expect(result.progress.percentComplete).toBe(60);
    });

    it('should handle unknown milestone', () => {
      const result = checkMilestone({
        userId: 'user-1',
        milestoneId: 'unknown',
        currentValue: 100,
      });
      expect(result.completed).toBe(false);
      expect(result.progress.threshold).toBe(0);
    });

    it('should calculate percent complete correctly', () => {
      const result = checkMilestone({
        userId: 'user-1',
        milestoneId: 'sessions-100',
        currentValue: 50,
      });
      expect(result.progress.percentComplete).toBe(50);
    });
  });

  describe('getMilestonesByType', () => {
    it('should return level milestones', () => {
      const milestones = getMilestonesByType('LEVEL');
      expect(milestones).toContain('level-3');
      expect(milestones).toContain('level-5');
      expect(milestones).toContain('level-10');
    });

    it('should return streak milestones', () => {
      const milestones = getMilestonesByType('STREAK_DAYS');
      expect(milestones).toContain('streak-7');
      expect(milestones).toContain('streak-30');
    });

    it('should return empty array for unknown type', () => {
      const milestones = getMilestonesByType('UNKNOWN' as any);
      expect(milestones).toEqual([]);
    });
  });

  describe('getMilestoneProgress', () => {
    it('should return progress for valid milestone', () => {
      const progress = getMilestoneProgress('level-10', 7);
      expect(progress).not.toBeNull();
      expect(progress?.milestoneId).toBe('level-10');
      expect(progress?.currentValue).toBe(7);
      expect(progress?.threshold).toBe(10);
      expect(progress?.percentComplete).toBe(70);
      expect(progress?.completed).toBe(false);
    });

    it('should return completed for exceeded threshold', () => {
      const progress = getMilestoneProgress('streak-7', 10);
      expect(progress?.completed).toBe(true);
      expect(progress?.percentComplete).toBe(100);
    });

    it('should return null for unknown milestone', () => {
      const progress = getMilestoneProgress('unknown', 100);
      expect(progress).toBeNull();
    });
  });

  describe('buildMilestoneTimeline', () => {
    it('should build timeline with progress', () => {
      const timeline = buildMilestoneTimeline('user-1', {
        'level-3': 3,
        'level-5': 4,
        'streak-7': 7,
      });

      expect(timeline.completedCount).toBe(2); // level-3 and streak-7
      expect(timeline.totalCount).toBeGreaterThan(0);
      expect(timeline.nextMilestone).not.toBeNull();
    });

    it('should identify next milestone', () => {
      const timeline = buildMilestoneTimeline('user-1', {
        'level-3': 3,
        'level-5': 5,
      });

      // level-10 should be next since level-3 and level-5 are completed
      expect(timeline.nextMilestone?.milestoneId).toBe('level-10');
    });

    it('should handle empty progress', () => {
      const timeline = buildMilestoneTimeline('user-1', {});
      expect(timeline.completedCount).toBe(0);
      expect(timeline.nextMilestone).not.toBeNull();
    });
  });

  describe('getUnlocksForLevel', () => {
    it('should return unlocks for level 5', () => {
      const unlocks = getUnlocksForLevel(5);
      expect(unlocks.some(u => u.featureId === 'boss-battles')).toBe(true);
    });

    it('should return more unlocks for higher level', () => {
      const lowLevel = getUnlocksForLevel(3);
      const highLevel = getUnlocksForLevel(15);
      expect(highLevel.length).toBeGreaterThanOrEqual(lowLevel.length);
    });

    it('should not return already unlocked items', () => {
      const unlocks = getUnlocksForLevel(100);
      expect(unlocks.every(u => !u.unlockedAt)).toBe(true);
    });
  });

  describe('checkUnlockStatus', () => {
    it('should show boss battles unlocked at level 5', () => {
      const status = checkUnlockStatus('boss-battles', 5);
      expect(status.unlocked).toBe(true);
      expect(status.requiredLevel).toBe(3);
    });

    it('should show squads locked at level 3', () => {
      const status = checkUnlockStatus('squads', 3);
      expect(status.unlocked).toBe(false);
      expect(status.requiredLevel).toBe(5);
    });

    it('should default to unlocked for unknown feature', () => {
      const status = checkUnlockStatus('unknown', 1);
      expect(status.unlocked).toBe(true);
    });
  });

  describe('evaluateMilestones', () => {
    it('should evaluate all milestone types', () => {
      const results = evaluateMilestones('user-1', {
        level: 10,
        streakDays: 7,
        sessionsCompleted: 50,
        bossDefeats: 5,
      });

      expect(results.length).toBeGreaterThan(0);

      // Check level milestones
      const levelMilestone = results.find(r => r.milestoneId === 'level-10');
      expect(levelMilestone?.completed).toBe(true);

      // Check streak milestones
      const streakMilestone = results.find(r => r.milestoneId === 'streak-7');
      expect(streakMilestone?.completed).toBe(true);

      // Check session milestones
      const sessionMilestone = results.find(r => r.milestoneId === 'sessions-50');
      expect(sessionMilestone?.completed).toBe(true);

      // Check boss milestones
      const bossMilestone = results.find(r => r.milestoneId === 'boss-5');
      expect(bossMilestone?.completed).toBe(true);
    });

    it('should mark newly completed milestones', () => {
      const results = evaluateMilestones('user-1', {
        level: 3,
        streakDays: 3,
        sessionsCompleted: 10,
        bossDefeats: 1,
      });

      const newlyCompleted = results.filter(r => r.newlyCompleted);
      // All should be newly completed since they're at exact threshold
      expect(newlyCompleted.length).toBeGreaterThan(0);
    });

    it('should handle zero progress', () => {
      const results = evaluateMilestones('user-1', {
        level: 1,
        streakDays: 0,
        sessionsCompleted: 0,
        bossDefeats: 0,
      });

      expect(results.every(r => !r.completed)).toBe(true);
    });
  });
});
