import {
  calculateStudyProgress,
  getStudyStreakMessage,
} from '../session/study-loop';
import { createMockPlan } from './study-loop-test-helpers';

describe('Study Loop — Progress & Streaks', () => {
  describe('calculateStudyProgress', () => {
    it('calculates progress correctly', () => {
      const plan = createMockPlan({
        sessionsCompleted: 2,
        status: 'active' as const,
        startedAt: Date.now(),
        sessions: [
          { id: 's1', title: 'Session 1', completed: true },
          { id: 's2', title: 'Session 2', completed: true },
          { id: 's3', title: 'Session 3', completed: false },
          { id: 's4', title: 'Session 4', completed: false },
          { id: 's5', title: 'Session 5', completed: false },
        ],
      });
      const progress = calculateStudyProgress(plan);
      expect(progress.percentage).toBe(40);
      expect(progress.completionRate).toBe(40);
      expect(progress.sessionsRemaining).toBe(3);
      expect(progress.estimatedMinutesRemaining).toBe(90);
      expect(progress.streak).toBe(2);
    });

    it('returns 0% for new plan', () => {
      const plan = createMockPlan({
        sessions: [
          { id: 's1', title: 'Session 1', completed: false },
          { id: 's2', title: 'Session 2', completed: false },
        ],
      });
      const progress = calculateStudyProgress(plan);
      expect(progress.percentage).toBe(0);
      expect(progress.streak).toBe(0);
    });
  });

  describe('getStudyStreakMessage', () => {
    it('returns ready message for new plan', () => {
      const plan = createMockPlan({ title: 'Learn TypeScript' });
      expect(getStudyStreakMessage(plan)).toContain('Ready to start');
    });

    it('returns congrats message for completed plan', () => {
      const plan = createMockPlan({
        title: 'Learn TypeScript',
        sessionsTotal: 3,
        sessionsCompleted: 3,
        status: 'completed' as const,
        startedAt: Date.now(),
        completedAt: Date.now(),
        sessions: [
          { id: 's1', title: 'Session 1', completed: true },
          { id: 's2', title: 'Session 2', completed: true },
          { id: 's3', title: 'Session 3', completed: true },
        ],
      });
      expect(getStudyStreakMessage(plan)).toContain('Congratulations');
    });

    it('returns streak message for consecutive sessions', () => {
      const plan = createMockPlan({
        title: 'Learn TypeScript',
        sessionsTotal: 5,
        sessionsCompleted: 3,
        status: 'active' as const,
        startedAt: Date.now(),
        sessions: [
          { id: 's1', title: 'Session 1', completed: true },
          { id: 's2', title: 'Session 2', completed: true },
          { id: 's3', title: 'Session 3', completed: true },
          { id: 's4', title: 'Session 4', completed: false },
        ],
      });
      expect(getStudyStreakMessage(plan)).toContain('3 sessions in a row');
    });

    it('returns progress message for partial completion', () => {
      const plan = createMockPlan({
        title: 'Learn TypeScript',
        sessionsTotal: 5,
        sessionsCompleted: 2,
        status: 'active' as const,
        startedAt: Date.now(),
        sessions: [
          { id: 's1', title: 'Session 1', completed: true },
          { id: 's2', title: 'Session 2', completed: false },
        ],
      });
      expect(getStudyStreakMessage(plan)).toContain('40% complete');
    });
  });
});
