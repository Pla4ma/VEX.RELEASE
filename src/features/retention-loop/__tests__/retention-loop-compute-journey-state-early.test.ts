import { describe, expect, it } from '@jest/globals';
import { computeJourneyState } from '../service';

const baseInput = {
  userId: 'u1',
  completedSessions: 0,
  hasCompletedToday: false,
  hasSeenMemoryInsight: false,
  rescueCompleted: 0,
  recentDismissals: 0,
  inactivityDays: 0,
  hasInsightReady: false,
};

describe('computeJourneyState', () => {
  it('Day 0: onboarding phase, curious, no nudge allowed', () => {
    const state = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 0,
      lane: 'student',
    });
    expect(state.day).toBe(0);
    expect(state.phase).toBe('onboarding');
    expect(state.emotionalState).toBe('curious');
    expect(state.nudgePolicy.canSend).toBe(false);
    expect(state.nudgePolicy.type).toBeNull();
    expect(state.momentType.type).toBe('none');
    expect(state.homeMessage.tone).toBe('warm');
    expect(state.premiumTrigger.trigger).toBe('none');
  });

  it('Day 1: return phase, familiar when completed today', () => {
    const state = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 1,
      completedSessions: 1,
      hasCompletedToday: true,
      lane: 'student',
    });
    expect(state.phase).toBe('return');
    expect(state.emotionalState).toBe('familiar');
    expect(state.nudgePolicy.type).toBe('gentle_return');
    expect(state.homeMessage.tone).toBe('direct');
  });

  it('Day 1: return phase, curious when not completed today', () => {
    const state = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 1,
      completedSessions: 0,
      hasCompletedToday: false,
      lane: 'student',
    });
    expect(state.emotionalState).toBe('curious');
  });

  it('Day 2: proof phase, validated emotional state', () => {
    const state = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 2,
      completedSessions: 2,
      lane: 'student',
    });
    expect(state.phase).toBe('proof');
    expect(state.emotionalState).toBe('validated');
    expect(state.nudgePolicy.type).toBe('proof_nudge');
    expect(state.momentType.type).toBe('proof_signal');
  });

  it('Day 3: insight phase, trusting emotional state, What VEX Learned moment', () => {
    const state = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 3,
      completedSessions: 3,
      lane: 'student',
    });
    expect(state.phase).toBe('insight');
    expect(state.emotionalState).toBe('trusting');
    expect(state.momentType.type).toBe('what_vex_learned');
    expect(state.momentType.requiresSessions).toBe(3);
    expect(state.momentType.canHide).toBe(true);
    expect(state.homeMessage.tone).toBe('humble');
  });

  it('Day 3: nudge type depends on hasInsightReady', () => {
    const withInsight = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 3,
      completedSessions: 3,
      hasInsightReady: true,
      lane: 'student',
    });
    expect(withInsight.nudgePolicy.type).toBe('memory_nudge');

    const withoutInsight = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 3,
      completedSessions: 3,
      hasInsightReady: false,
      lane: 'student',
    });
    expect(withoutInsight.nudgePolicy.type).toBe('gentle_return');
  });

  it('Day 4: rescue phase when inactive, lane_forming when active', () => {
    const inactive = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 4,
      completedSessions: 4,
      inactivityDays: 1,
      lane: 'student',
    });
    expect(inactive.phase).toBe('rescue');
    expect(inactive.emotionalState).toBe('struggling');
    expect(inactive.nudgePolicy.type).toBe('rescue');
    expect(inactive.homeMessage.tone).toBe('encouraging');

    const active = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 4,
      completedSessions: 4,
      inactivityDays: 0,
      recentDismissals: 0,
      lane: 'student',
    });
    expect(active.phase).toBe('lane_forming');
    expect(active.emotionalState).toBe('forming');
  });
});
