import { createRescuePlan, buildRescueCompletionMemory } from '../service';

describe('rescue mode', () => {
  it('creates a valid short rescue plan for each lane', () => {
    const lanes = ['student', 'game_like', 'deep_creative', 'minimal_normal'] as const;
    const plans = lanes.map((lane) => createRescuePlan({
      userId: 'u1',
      lane,
      reason: 'unclear',
      durationSeconds: 60 * 60,
      createdAt: 10,
    }));

    expect(plans.map((p) => p.durationSeconds)).toEqual([12 * 60, 12 * 60, 12 * 60, 12 * 60]);
    expect(plans.map((p) => p.sessionMode)).toEqual(['STUDY', 'SPRINT', 'CREATIVE', 'RECOVERY']);
  });

  it('keeps one-question rescue copy and memory candidate', () => {
    const plan = createRescuePlan({
      userId: 'u1',
      lane: 'minimal_normal',
      reason: 'too_big',
      createdAt: 20,
    });

    expect(plan.taskDescription).toBe('Do the smallest visible piece.');
    expect(buildRescueCompletionMemory(plan).source).toBe('rescue_completion');
  });
});
