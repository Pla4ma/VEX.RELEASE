import { StudyPlanSchema } from '../session/study-loop';

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
      }),
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
      }),
    ).toThrow();
  });
});
