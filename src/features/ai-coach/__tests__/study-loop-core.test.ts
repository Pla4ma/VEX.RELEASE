import {
  completeStudySession,
  createStudyPlan,
  getNextSession,
  startStudyPlan,
} from '../session/study-loop';
import { createMockPlan } from './study-loop-test-helpers';

describe('Study Loop — Core Operations', () => {
  describe('createStudyPlan', () => {
    it('creates study plan with sessions', async () => {
      const plan = await createStudyPlan('user-123', {
        title: 'Learn TypeScript',
        description: 'Master TypeScript',
        subject: 'Programming',
        goal: 'Build an app',
        sessionsTotal: 5,
        estimatedMinutesPerSession: 30,
        difficulty: 'beginner',
      });
      expect(plan.userId).toBe('user-123');
      expect(plan.title).toBe('Learn TypeScript');
      expect(plan.sessionsTotal).toBe(5);
      expect(plan.sessions.length).toBe(5);
      expect(plan.status).toBe('draft');
      expect(plan.sessionsCompleted).toBe(0);
    });
  });

  describe('startStudyPlan', () => {
    it('activates draft plan', () => {
      const plan = createMockPlan();
      const started = startStudyPlan(plan);
      expect(started.status).toBe('active');
      expect(started.startedAt).toBeLessThanOrEqual(Date.now());
    });

    it('throws error if not draft', () => {
      const plan = createMockPlan({
        status: 'active' as const,
        sessionsCompleted: 2,
        startedAt: Date.now(),
      });
      expect(() => startStudyPlan(plan)).toThrow(
        'Can only start plans in draft status',
      );
    });
  });

  describe('completeStudySession', () => {
    it('marks session as complete', () => {
      const plan = createMockPlan({
        status: 'active' as const,
        startedAt: Date.now(),
        sessions: [
          { id: 's1', title: 'Session 1', completed: false },
          { id: 's2', title: 'Session 2', completed: false },
          { id: 's3', title: 'Session 3', completed: false },
        ],
      });
      const updated = completeStudySession(plan, 's1', {
        sessionId: 's1',
        duration: 30,
        quality: 85,
        completed: true,
      });
      expect(updated.sessions[0].completed).toBe(true);
      expect(updated.sessionsCompleted).toBe(1);
      expect(updated.status).toBe('active');
    });

    it('completes plan when all sessions done', () => {
      const plan = createMockPlan({
        sessionsTotal: 3,
        sessionsCompleted: 2,
        status: 'active' as const,
        startedAt: Date.now(),
        sessions: [
          { id: 's1', title: 'Session 1', completed: true },
          { id: 's2', title: 'Session 2', completed: true },
          { id: 's3', title: 'Session 3', completed: false },
        ],
      });
      const updated = completeStudySession(plan, 's3', {
        sessionId: 's3',
        duration: 30,
        quality: 90,
        completed: true,
      });
      expect(updated.sessionsCompleted).toBe(3);
      expect(updated.status).toBe('completed');
      expect(updated.completedAt).toBeDefined();
    });
  });

  describe('getNextSession', () => {
    it('returns first incomplete session', () => {
      const plan = createMockPlan({
        sessionsCompleted: 1,
        status: 'active' as const,
        startedAt: Date.now(),
        sessions: [
          { id: 's1', title: 'Session 1', completed: true },
          { id: 's2', title: 'Session 2', completed: false },
          { id: 's3', title: 'Session 3', completed: false },
        ],
      });
      const next = getNextSession(plan);
      expect(next?.id).toBe('s2');
    });

    it('returns null when all complete', () => {
      const plan = createMockPlan({
        sessionsTotal: 2,
        sessionsCompleted: 2,
        status: 'completed' as const,
        startedAt: Date.now(),
        completedAt: Date.now(),
        sessions: [
          { id: 's1', title: 'Session 1', completed: true },
          { id: 's2', title: 'Session 2', completed: true },
        ],
      });
      expect(getNextSession(plan)).toBeNull();
    });
  });
});
