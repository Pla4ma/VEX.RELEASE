import {
  abandonStudyPlan,
  adjustStudyDifficulty,
  calculateStudyProgress,
  compareStudyPlans,
  completeStudySession,
  createStudyPlan,
  getNextSession,
  getNextStudyReminder,
  getStudyInsights,
  getStudyStreakMessage,
  needsAttention,
  startStudyPlan,
  StudyPlanSchema,
} from '../study-loop';

describe('Study Loop', () => {
  describe('StudyPlanSchema', () => {
    it('validates valid study plan', () => {
      const validPlan = {
        id: 'plan-123',
        userId: 'user-123',
        title: 'Learn TypeScript',
        description: 'Master TypeScript basics',
        subject: 'Programming',
        goal: 'Build a project',
        sessionsTotal: 5,
        sessionsCompleted: 0,
        estimatedMinutesPerSession: 30,
        difficulty: 'beginner',
        status: 'draft',
        createdAt: Date.now(),
        sessions: [
          { id: 's1', title: 'Session 1', completed: false },
          { id: 's2', title: 'Session 2', completed: false },
        ],
      };

      expect(StudyPlanSchema.parse(validPlan)).toEqual(validPlan);
    });

    it('rejects invalid difficulty', () => {
      expect(() =>
        StudyPlanSchema.parse({
          id: 'plan-123',
          userId: 'user-123',
          title: 'Test',
          description: 'Test',
          subject: 'Test',
          goal: 'Test',
          sessionsTotal: 3,
          sessionsCompleted: 0,
          estimatedMinutesPerSession: 30,
          difficulty: 'invalid',
          status: 'draft',
          createdAt: Date.now(),
          sessions: [],
        })
      ).toThrow();
    });

    it('rejects invalid status', () => {
      expect(() =>
        StudyPlanSchema.parse({
          id: 'plan-123',
          userId: 'user-123',
          title: 'Test',
          description: 'Test',
          subject: 'Test',
          goal: 'Test',
          sessionsTotal: 3,
          sessionsCompleted: 0,
          estimatedMinutesPerSession: 30,
          difficulty: 'beginner',
          status: 'invalid',
          createdAt: Date.now(),
          sessions: [],
        })
      ).toThrow();
    });
  });

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
      const plan = {
        id: 'plan-123',
        userId: 'user-123',
        title: 'Test',
        description: 'Test',
        subject: 'Test',
        goal: 'Test',
        sessionsTotal: 3,
        sessionsCompleted: 0,
        estimatedMinutesPerSession: 30,
        difficulty: 'beginner' as const,
        status: 'draft' as const,
        createdAt: Date.now(),
        sessions: [],
      };

      const started = startStudyPlan(plan);

      expect(started.status).toBe('active');
      expect(started.startedAt).toBeLessThanOrEqual(Date.now());
    });

    it('throws error if not draft', () => {
      const plan = {
        id: 'plan-123',
        userId: 'user-123',
        title: 'Test',
        description: 'Test',
        subject: 'Test',
        goal: 'Test',
        sessionsTotal: 3,
        sessionsCompleted: 2,
        estimatedMinutesPerSession: 30,
        difficulty: 'beginner' as const,
        status: 'active' as const,
        createdAt: Date.now(),
        startedAt: Date.now(),
        sessions: [],
      };

      expect(() => startStudyPlan(plan)).toThrow('Can only start plans in draft status');
    });
  });

  describe('completeStudySession', () => {
    it('marks session as complete', () => {
      const plan = {
        id: 'plan-123',
        userId: 'user-123',
        title: 'Test',
        description: 'Test',
        subject: 'Test',
        goal: 'Test',
        sessionsTotal: 3,
        sessionsCompleted: 0,
        estimatedMinutesPerSession: 30,
        difficulty: 'beginner' as const,
        status: 'active' as const,
        createdAt: Date.now(),
        startedAt: Date.now(),
        sessions: [
          { id: 's1', title: 'Session 1', completed: false },
          { id: 's2', title: 'Session 2', completed: false },
          { id: 's3', title: 'Session 3', completed: false },
        ],
      };

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
      const plan = {
        id: 'plan-123',
        userId: 'user-123',
        title: 'Test',
        description: 'Test',
        subject: 'Test',
        goal: 'Test',
        sessionsTotal: 3,
        sessionsCompleted: 2,
        estimatedMinutesPerSession: 30,
        difficulty: 'beginner' as const,
        status: 'active' as const,
        createdAt: Date.now(),
        startedAt: Date.now(),
        sessions: [
          { id: 's1', title: 'Session 1', completed: true },
          { id: 's2', title: 'Session 2', completed: true },
          { id: 's3', title: 'Session 3', completed: false },
        ],
      };

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
      const plan = {
        id: 'plan-123',
        userId: 'user-123',
        title: 'Test',
        description: 'Test',
        subject: 'Test',
        goal: 'Test',
        sessionsTotal: 3,
        sessionsCompleted: 1,
        estimatedMinutesPerSession: 30,
        difficulty: 'beginner' as const,
        status: 'active' as const,
        createdAt: Date.now(),
        startedAt: Date.now(),
        sessions: [
          { id: 's1', title: 'Session 1', completed: true },
          { id: 's2', title: 'Session 2', completed: false },
          { id: 's3', title: 'Session 3', completed: false },
        ],
      };

      const next = getNextSession(plan);

      expect(next?.id).toBe('s2');
    });

    it('returns null when all complete', () => {
      const plan = {
        id: 'plan-123',
        userId: 'user-123',
        title: 'Test',
        description: 'Test',
        subject: 'Test',
        goal: 'Test',
        sessionsTotal: 2,
        sessionsCompleted: 2,
        estimatedMinutesPerSession: 30,
        difficulty: 'beginner' as const,
        status: 'completed' as const,
        createdAt: Date.now(),
        startedAt: Date.now(),
        completedAt: Date.now(),
        sessions: [
          { id: 's1', title: 'Session 1', completed: true },
          { id: 's2', title: 'Session 2', completed: true },
        ],
      };

      expect(getNextSession(plan)).toBeNull();
    });
  });

  describe('calculateStudyProgress', () => {
    it('calculates progress correctly', () => {
      const plan = {
        id: 'plan-123',
        userId: 'user-123',
        title: 'Test',
        description: 'Test',
        subject: 'Test',
        goal: 'Test',
        sessionsTotal: 5,
        sessionsCompleted: 2,
        estimatedMinutesPerSession: 30,
        difficulty: 'beginner' as const,
        status: 'active' as const,
        createdAt: Date.now(),
        startedAt: Date.now(),
        sessions: [
          { id: 's1', title: 'Session 1', completed: true },
          { id: 's2', title: 'Session 2', completed: true },
          { id: 's3', title: 'Session 3', completed: false },
          { id: 's4', title: 'Session 4', completed: false },
          { id: 's5', title: 'Session 5', completed: false },
        ],
      };

      const progress = calculateStudyProgress(plan);

      expect(progress.percentage).toBe(40);
      expect(progress.completionRate).toBe(40);
      expect(progress.sessionsRemaining).toBe(3);
      expect(progress.estimatedMinutesRemaining).toBe(90);
      expect(progress.streak).toBe(2);
    });

    it('returns 0% for new plan', () => {
      const plan = {
        id: 'plan-123',
        userId: 'user-123',
        title: 'Test',
        description: 'Test',
        subject: 'Test',
        goal: 'Test',
        sessionsTotal: 5,
        sessionsCompleted: 0,
        estimatedMinutesPerSession: 30,
        difficulty: 'beginner' as const,
        status: 'draft' as const,
        createdAt: Date.now(),
        sessions: [
          { id: 's1', title: 'Session 1', completed: false },
          { id: 's2', title: 'Session 2', completed: false },
        ],
      };

      const progress = calculateStudyProgress(plan);

      expect(progress.percentage).toBe(0);
      expect(progress.streak).toBe(0);
    });
  });

  describe('getStudyStreakMessage', () => {
    it('returns ready message for new plan', () => {
      const plan = {
        id: 'plan-123',
        userId: 'user-123',
        title: 'Learn TypeScript',
        description: 'Master TS',
        subject: 'Programming',
        goal: 'Build app',
        sessionsTotal: 5,
        sessionsCompleted: 0,
        estimatedMinutesPerSession: 30,
        difficulty: 'beginner' as const,
        status: 'draft' as const,
        createdAt: Date.now(),
        sessions: [],
      };

      expect(getStudyStreakMessage(plan)).toContain('Ready to start');
    });

    it('returns congrats message for completed plan', () => {
      const plan = {
        id: 'plan-123',
        userId: 'user-123',
        title: 'Learn TypeScript',
        description: 'Master TS',
        subject: 'Programming',
        goal: 'Build app',
        sessionsTotal: 3,
        sessionsCompleted: 3,
        estimatedMinutesPerSession: 30,
        difficulty: 'beginner' as const,
        status: 'completed' as const,
        createdAt: Date.now(),
        startedAt: Date.now(),
        completedAt: Date.now(),
        sessions: [
          { id: 's1', title: 'Session 1', completed: true },
          { id: 's2', title: 'Session 2', completed: true },
          { id: 's3', title: 'Session 3', completed: true },
        ],
      };

      expect(getStudyStreakMessage(plan)).toContain('Congratulations');
    });

    it('returns streak message for consecutive sessions', () => {
      const plan = {
        id: 'plan-123',
        userId: 'user-123',
        title: 'Learn TypeScript',
        description: 'Master TS',
        subject: 'Programming',
        goal: 'Build app',
        sessionsTotal: 5,
        sessionsCompleted: 3,
        estimatedMinutesPerSession: 30,
        difficulty: 'beginner' as const,
        status: 'active' as const,
        createdAt: Date.now(),
        startedAt: Date.now(),
        sessions: [
          { id: 's1', title: 'Session 1', completed: true },
          { id: 's2', title: 'Session 2', completed: true },
          { id: 's3', title: 'Session 3', completed: true },
          { id: 's4', title: 'Session 4', completed: false },
        ],
      };

      expect(getStudyStreakMessage(plan)).toContain('3 sessions in a row');
    });

    it('returns progress message for partial completion', () => {
      const plan = {
        id: 'plan-123',
        userId: 'user-123',
        title: 'Learn TypeScript',
        description: 'Master TS',
        subject: 'Programming',
        goal: 'Build app',
        sessionsTotal: 5,
        sessionsCompleted: 2,
        estimatedMinutesPerSession: 30,
        difficulty: 'beginner' as const,
        status: 'active' as const,
        createdAt: Date.now(),
        startedAt: Date.now(),
        sessions: [
          { id: 's1', title: 'Session 1', completed: true },
          { id: 's2', title: 'Session 2', completed: false },
        ],
      };

      expect(getStudyStreakMessage(plan)).toContain('40% complete');
    });
  });

  describe('needsAttention', () => {
    it('returns true when stalled for 48 hours', () => {
      const plan = {
        id: 'plan-123',
        userId: 'user-123',
        title: 'Test',
        description: 'Test',
        subject: 'Test',
        goal: 'Test',
        sessionsTotal: 5,
        sessionsCompleted: 2,
        estimatedMinutesPerSession: 30,
        difficulty: 'beginner' as const,
        status: 'active' as const,
        createdAt: Date.now(),
        startedAt: Date.now(),
        sessions: [],
      };

      const lastSessionAt = Date.now() - 50 * 60 * 60 * 1000;

      expect(needsAttention(plan, lastSessionAt)).toBe(true);
    });

    it('returns true when near completion but stalled', () => {
      const plan = {
        id: 'plan-123',
        userId: 'user-123',
        title: 'Test',
        description: 'Test',
        subject: 'Test',
        goal: 'Test',
        sessionsTotal: 5,
        sessionsCompleted: 4,
        estimatedMinutesPerSession: 30,
        difficulty: 'beginner' as const,
        status: 'active' as const,
        createdAt: Date.now(),
        startedAt: Date.now(),
        sessions: [],
      };

      expect(needsAttention(plan)).toBe(true);
    });

    it('returns false for inactive plans', () => {
      const plan = {
        id: 'plan-123',
        userId: 'user-123',
        title: 'Test',
        description: 'Test',
        subject: 'Test',
        goal: 'Test',
        sessionsTotal: 5,
        sessionsCompleted: 0,
        estimatedMinutesPerSession: 30,
        difficulty: 'beginner' as const,
        status: 'draft' as const,
        createdAt: Date.now(),
        sessions: [],
      };

      expect(needsAttention(plan)).toBe(false);
    });
  });

  describe('adjustStudyDifficulty', () => {
    it('increases difficulty when high quality', () => {
      const plan = {
        id: 'plan-123',
        userId: 'user-123',
        title: 'Test',
        description: 'Test',
        subject: 'Test',
        goal: 'Test',
        sessionsTotal: 5,
        sessionsCompleted: 3,
        estimatedMinutesPerSession: 30,
        difficulty: 'beginner' as const,
        status: 'active' as const,
        createdAt: Date.now(),
        startedAt: Date.now(),
        sessions: [],
      };

      const adjusted = adjustStudyDifficulty(plan, 95);

      expect(adjusted.difficulty).toBe('intermediate');
    });

    it('decreases difficulty when low quality', () => {
      const plan = {
        id: 'plan-123',
        userId: 'user-123',
        title: 'Test',
        description: 'Test',
        subject: 'Test',
        goal: 'Test',
        sessionsTotal: 5,
        sessionsCompleted: 3,
        estimatedMinutesPerSession: 30,
        difficulty: 'advanced' as const,
        status: 'active' as const,
        createdAt: Date.now(),
        startedAt: Date.now(),
        sessions: [],
      };

      const adjusted = adjustStudyDifficulty(plan, 50);

      expect(adjusted.difficulty).toBe('intermediate');
    });

    it('stays same when quality normal', () => {
      const plan = {
        id: 'plan-123',
        userId: 'user-123',
        title: 'Test',
        description: 'Test',
        subject: 'Test',
        goal: 'Test',
        sessionsTotal: 5,
        sessionsCompleted: 3,
        estimatedMinutesPerSession: 30,
        difficulty: 'beginner' as const,
        status: 'active' as const,
        createdAt: Date.now(),
        startedAt: Date.now(),
        sessions: [],
      };

      const adjusted = adjustStudyDifficulty(plan, 75);

      expect(adjusted.difficulty).toBe('beginner');
    });
  });

  describe('abandonStudyPlan', () => {
    it('marks plan as abandoned', () => {
      const plan = {
        id: 'plan-123',
        userId: 'user-123',
        title: 'Test',
        description: 'Test',
        subject: 'Test',
        goal: 'Test',
        sessionsTotal: 5,
        sessionsCompleted: 2,
        estimatedMinutesPerSession: 30,
        difficulty: 'beginner' as const,
        status: 'active' as const,
        createdAt: Date.now(),
        startedAt: Date.now(),
        sessions: [],
      };

      const abandoned = abandonStudyPlan(plan, 'Too hard');

      expect(abandoned.status).toBe('abandoned');
    });
  });

  describe('getStudyInsights', () => {
    it('identifies strong areas when high completion', () => {
      const plan = {
        id: 'plan-123',
        userId: 'user-123',
        title: 'Test',
        description: 'Test',
        subject: 'Test',
        goal: 'Test',
        sessionsTotal: 5,
        sessionsCompleted: 4,
        estimatedMinutesPerSession: 30,
        difficulty: 'beginner' as const,
        status: 'active' as const,
        createdAt: Date.now(),
        startedAt: Date.now(),
        sessions: [
          { id: 's1', title: 'Session 1', completed: true, duration: 30 },
          { id: 's2', title: 'Session 2', completed: true, duration: 30 },
          { id: 's3', title: 'Session 3', completed: true, duration: 30 },
          { id: 's4', title: 'Session 4', completed: true, duration: 30 },
        ],
      };

      const insights = getStudyInsights(plan);

      expect(insights.strongAreas).toContain('Consistency');
      expect(insights.completionRate).toBe(80);
      expect(insights.avgSessionDuration).toBe(30);
    });

    it('identifies improvement areas when low completion', () => {
      const plan = {
        id: 'plan-123',
        userId: 'user-123',
        title: 'Test',
        description: 'Test',
        subject: 'Test',
        goal: 'Test',
        sessionsTotal: 5,
        sessionsCompleted: 2,
        estimatedMinutesPerSession: 30,
        difficulty: 'beginner' as const,
        status: 'active' as const,
        createdAt: Date.now(),
        startedAt: Date.now(),
        sessions: [
          { id: 's1', title: 'Session 1', completed: true, duration: 30 },
          { id: 's2', title: 'Session 2', completed: true, duration: 30 },
        ],
      };

      const insights = getStudyInsights(plan);

      expect(insights.improvementAreas).toContain('Session completion');
    });

    it('returns 0 avg duration when no completed sessions', () => {
      const plan = {
        id: 'plan-123',
        userId: 'user-123',
        title: 'Test',
        description: 'Test',
        subject: 'Test',
        goal: 'Test',
        sessionsTotal: 5,
        sessionsCompleted: 0,
        estimatedMinutesPerSession: 30,
        difficulty: 'beginner' as const,
        status: 'draft' as const,
        createdAt: Date.now(),
        sessions: [],
      };

      const insights = getStudyInsights(plan);

      expect(insights.avgSessionDuration).toBe(0);
    });
  });

  describe('getNextStudyReminder', () => {
    it('returns final session reminder for last session', () => {
      const plan = {
        id: 'plan-123',
        userId: 'user-123',
        title: 'Learn TypeScript',
        description: 'Master TS',
        subject: 'Programming',
        goal: 'Build app',
        sessionsTotal: 5,
        sessionsCompleted: 4,
        estimatedMinutesPerSession: 30,
        difficulty: 'beginner' as const,
        status: 'active' as const,
        createdAt: Date.now(),
        startedAt: Date.now(),
        sessions: [
          { id: 's1', title: 'Session 1', completed: true },
          { id: 's2', title: 'Session 2', completed: true },
          { id: 's3', title: 'Session 3', completed: true },
          { id: 's4', title: 'Session 4', completed: true },
          { id: 's5', title: 'Session 5', completed: false },
        ],
      };

      const reminder = getNextStudyReminder(plan);

      expect(reminder.shouldRemind).toBe(true);
      expect(reminder.urgency).toBe('high');
      expect(reminder.message).toContain('Final session');
    });

    it('returns progress reminder when >75% complete', () => {
      const plan = {
        id: 'plan-123',
        userId: 'user-123',
        title: 'Learn TypeScript',
        description: 'Master TS',
        subject: 'Programming',
        goal: 'Build app',
        sessionsTotal: 4,
        sessionsCompleted: 3,
        estimatedMinutesPerSession: 30,
        difficulty: 'beginner' as const,
        status: 'active' as const,
        createdAt: Date.now(),
        startedAt: Date.now(),
        sessions: [
          { id: 's1', title: 'Session 1', completed: true },
          { id: 's2', title: 'Session 2', completed: true },
          { id: 's3', title: 'Session 3', completed: true },
          { id: 's4', title: 'Session 4', completed: false },
        ],
      };

      const reminder = getNextStudyReminder(plan);

      expect(reminder.shouldRemind).toBe(true);
      expect(reminder.urgency).toBe('medium');
      expect(reminder.message).toContain('75%');
    });

    it('returns low urgency for normal progress', () => {
      const plan = {
        id: 'plan-123',
        userId: 'user-123',
        title: 'Learn TypeScript',
        description: 'Master TS',
        subject: 'Programming',
        goal: 'Build app',
        sessionsTotal: 5,
        sessionsCompleted: 1,
        estimatedMinutesPerSession: 30,
        difficulty: 'beginner' as const,
        status: 'active' as const,
        createdAt: Date.now(),
        startedAt: Date.now(),
        sessions: [
          { id: 's1', title: 'Session 1', completed: true },
          { id: 's2', title: 'Session 2', completed: false },
        ],
      };

      const reminder = getNextStudyReminder(plan);

      expect(reminder.shouldRemind).toBe(true);
      expect(reminder.urgency).toBe('low');
    });

    it('returns no reminder when all complete', () => {
      const plan = {
        id: 'plan-123',
        userId: 'user-123',
        title: 'Learn TypeScript',
        description: 'Master TS',
        subject: 'Programming',
        goal: 'Build app',
        sessionsTotal: 2,
        sessionsCompleted: 2,
        estimatedMinutesPerSession: 30,
        difficulty: 'beginner' as const,
        status: 'completed' as const,
        createdAt: Date.now(),
        startedAt: Date.now(),
        completedAt: Date.now(),
        sessions: [
          { id: 's1', title: 'Session 1', completed: true },
          { id: 's2', title: 'Session 2', completed: true },
        ],
      };

      const reminder = getNextStudyReminder(plan);

      expect(reminder.shouldRemind).toBe(false);
    });
  });

  describe('compareStudyPlans', () => {
    it('compares two plans correctly', () => {
      const planA = {
        id: 'plan-a',
        userId: 'user-123',
        title: 'Plan A',
        description: 'Fast plan',
        subject: 'Test',
        goal: 'Test',
        sessionsTotal: 3,
        sessionsCompleted: 1,
        estimatedMinutesPerSession: 30,
        difficulty: 'advanced' as const,
        status: 'active' as const,
        createdAt: Date.now(),
        startedAt: Date.now(),
        sessions: [],
      };

      const planB = {
        id: 'plan-b',
        userId: 'user-123',
        title: 'Plan B',
        description: 'Slow plan',
        subject: 'Test',
        goal: 'Test',
        sessionsTotal: 5,
        sessionsCompleted: 1,
        estimatedMinutesPerSession: 30,
        difficulty: 'beginner' as const,
        status: 'active' as const,
        createdAt: Date.now(),
        startedAt: Date.now(),
        sessions: [],
      };

      const comparison = compareStudyPlans(planA, planB);

      expect(comparison.faster.id).toBe('plan-a');
      expect(comparison.moreDifficult.id).toBe('plan-a');
      expect(comparison.higherCompletion.id).toBe('plan-b');
    });
  });
});
