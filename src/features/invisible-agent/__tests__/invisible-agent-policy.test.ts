import {
  buildDeterministicDecision,
} from '../service';
import { validateCoachAgentDecision } from '../policy';
import type { AgentContextSnapshot } from '../schemas';

const base: AgentContextSnapshot = {
  userId: 'user-1',
  isOnline: true,
  completedToday: false,
  currentStreak: 2,
  hoursUntilStreakDeadline: null,
  recentSessionIds: [],
  activeStudyPackId: null,
  lowEnergyPattern: false,
  trustLevel: 'normal',
};

describe('invisible agent decisions', () => {
  it('does not guilt users who already completed today', () => {
    const decision = buildDeterministicDecision({
      ...base,
      completedToday: true,
    });
    expect(decision.type).toBe('NO_ACTION');
    expect(decision.reasonCode).toBe('ENOUGH_DONE_TODAY');
  });

  it('does not suggest cloud-only study action while offline', () => {
    const decision = validateCoachAgentDecision(
      {
        ...buildDeterministicDecision({
          ...base,
          activeStudyPackId: 'pack-1',
        }),
        type: 'CONTINUE_STUDY_PLAN',
      },
      { ...base, isOnline: false },
    );
    expect(decision.type).toBe('NO_ACTION');
  });

  it('uses streak rescue when deadline is close', () => {
    const decision = buildDeterministicDecision({
      ...base,
      hoursUntilStreakDeadline: 2,
    });
    expect(decision.type).toBe('RESCUE_STREAK');
    expect(decision.policy.canAutoExecute).toBe(false);
  });
});
