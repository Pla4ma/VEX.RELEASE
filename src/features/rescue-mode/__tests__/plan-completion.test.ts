import {
  makePlan,
  createRescuePlan,
  buildRescueCompletionMemory,
  buildRescueCompletionRecord,
  generateRescueReflection,
} from './helpers';

describe('rescue mode — plan creation', () => {
  it('creates a rescue plan with duration 5-12 minutes', () => {
    const plan = makePlan({ lane: 'student', reason: 'unclear' });
    expect(plan.durationSeconds).toBeGreaterThanOrEqual(5 * 60);
    expect(plan.durationSeconds).toBeLessThanOrEqual(12 * 60);
  });

  it('differs copy by lane', () => {
    const student = makePlan({ lane: 'student', reason: 'too_big' });
    const run = makePlan({ lane: 'game_like', reason: 'too_big' });
    const project = makePlan({ lane: 'deep_creative', reason: 'too_big' });
    const clean = makePlan({ lane: 'minimal_normal', reason: 'too_big' });

    expect(student.taskDescription).toContain('notes');
    expect(run.taskDescription).toContain('Recovery');
    expect(project.taskDescription).toContain('project');
    expect(clean.taskDescription).toContain('5 minutes');
  });

  it('assigns correct session mode per lane', () => {
    const lanes = [
      'student',
      'game_like',
      'deep_creative',
      'minimal_normal',
    ] as const;
    const plans = lanes.map((lane) =>
      createRescuePlan({ userId: 'u1', lane, reason: 'unclear' }),
    );
    expect(plans.map((p) => p.sessionMode)).toEqual([
      'STUDY',
      'SPRINT',
      'CREATIVE',
      'RECOVERY',
    ]);
  });

  it('minimal_normal lane rescue stays discreet (soft friction)', () => {
    const plan = makePlan({ lane: 'minimal_normal', reason: 'distracted' });
    expect(plan.frictionLevel).toBe('soft');
    expect(plan.durationSeconds).toBeLessThanOrEqual(5 * 60);
  });
});

describe('rescue mode — completion', () => {
  it('generates memory candidate on completion', () => {
    const plan = makePlan({ lane: 'student', reason: 'unclear' });
    const memory = buildRescueCompletionMemory(plan, 'completed');
    expect(memory.source).toBe('rescue_completion');
    expect(memory.confidence).toBeGreaterThan(0.7);
    expect(memory.text).toContain('successfully');
  });

  it('generates completion record with outcome and recommendation', () => {
    const plan = makePlan({ lane: 'game_like', reason: 'too_big' });
    const record = buildRescueCompletionRecord(plan, 'completed', 600);
    expect(record.outcome).toBe('completed');
    expect(record.worked).toBe(true);
    expect(record.reason).toBe('too_big');
    expect(record.nextRecommendation).toBeTruthy();
    expect(record.durationSeconds).toBe(600);
  });

  it('marks partial completion as worked', () => {
    const plan = makePlan({ lane: 'deep_creative', reason: 'tired' });
    const record = buildRescueCompletionRecord(plan, 'partial', 300);
    expect(record.outcome).toBe('partial');
    expect(record.worked).toBe(true);
  });

  it('marks abandoned as not worked', () => {
    const plan = makePlan({ lane: 'minimal_normal', reason: 'anxious' });
    const record = buildRescueCompletionRecord(plan, 'abandoned', 60);
    expect(record.outcome).toBe('abandoned');
    expect(record.worked).toBe(false);
  });

  it('does not shame user in reflection', () => {
    const plan = makePlan({ lane: 'student', reason: 'anxious' });
    const reflection = generateRescueReflection(plan, 'abandoned');
    expect(reflection).toContain('okay');
    expect(reflection).not.toContain('fail');
    expect(reflection).not.toContain('lose');
    expect(reflection).not.toContain('shame');
  });
});
