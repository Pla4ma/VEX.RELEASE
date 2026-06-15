import { buildDay0AgentPlan } from '../day0-agent-service';

describe('buildDay0AgentPlan', () => {
  it('creates three real plan steps for Study mode', () => {
    const plan = buildDay0AgentPlan({
      intent: 'biology chapter 4',
      mode: 'study',
    });

    expect(plan.mode).toBe('study');
    expect(plan.steps).toHaveLength(3);
    expect(plan.steps[0]?.tags).toContain('study');
  });

  it('keeps Quest mode action-oriented', () => {
    const plan = buildDay0AgentPlan({
      intent: 'clear my inbox',
      mode: 'quest',
    });

    expect(plan.title).toBe('First Quest Signal');
    expect(plan.steps[1]?.priority).toBe('high');
  });
});
