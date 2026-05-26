/**
 * VEX Phase 17 — Journeys: Rescue mode (Category 7)
 */
import { describe, expect, it } from '@jest/globals';
import {
  createRescuePlan, isRescueEligible, buildRescueCompletionMemory,
  shouldSendRescuePush, buildRescuePushPayload,
} from '../../features/rescue-mode/service';
import type { Lane } from '../../features/lane-engine/types';

const ALL_LANES: Lane[] = ['student', 'game_like', 'deep_creative', 'minimal_normal'];

describe('Phase 17 — Rescue: Hidden before signal', () => {
  it('not eligible on cold Day 0', () => {
    const result = isRescueEligible({
      userId: 'u1', lane: 'student', completedSessions: 0, daysSinceOnboarding: 0,
      abandonedSessionExists: false, missedPlannedSession: false, recentDismissals: 0,
      streakAtRisk: false, hoursUntilStreakBreak: 24, hasActiveSession: false, now: 100,
    });
    expect(result.eligible).toBe(false);
    expect(result.reason).toContain('Day 0');
  });

  it('not eligible without any trigger signal', () => {
    const result = isRescueEligible({
      userId: 'u1', lane: 'student', completedSessions: 1, daysSinceOnboarding: 1,
      abandonedSessionExists: false, missedPlannedSession: false, recentDismissals: 0,
      streakAtRisk: false, hoursUntilStreakBreak: 24, hasActiveSession: false, now: 100,
    });
    expect(result.eligible).toBe(false);
  });
});

describe('Phase 17 — Rescue: Visible after avoidance', () => {
  it('eligible after abandoned session', () => {
    const result = isRescueEligible({
      userId: 'u1', lane: 'student', completedSessions: 3, daysSinceOnboarding: 2,
      abandonedSessionExists: true, missedPlannedSession: false, recentDismissals: 0,
      streakAtRisk: false, hoursUntilStreakBreak: 24, hasActiveSession: false, now: 100,
    });
    expect(result.eligible).toBe(true);
    expect(result.trigger).toBe('abandoned_session');
  });

  it('eligible after missed planned session', () => {
    const result = isRescueEligible({
      userId: 'u1', lane: 'game_like', completedSessions: 2, daysSinceOnboarding: 3,
      abandonedSessionExists: false, missedPlannedSession: true, recentDismissals: 0,
      streakAtRisk: false, hoursUntilStreakBreak: 24, hasActiveSession: false, now: 100,
    });
    expect(result.eligible).toBe(true);
    expect(result.trigger).toBe('missed_planned');
  });

  it('eligible for notification_dismissal_pattern (3+ dismissals)', () => {
    const result = isRescueEligible({
      userId: 'u1', lane: 'minimal_normal', completedSessions: 3, daysSinceOnboarding: 2,
      abandonedSessionExists: false, missedPlannedSession: false, recentDismissals: 4,
      streakAtRisk: false, hoursUntilStreakBreak: 24, hasActiveSession: false, now: 100,
    });
    expect(result.eligible).toBe(true);
    expect(result.trigger).toBe('notification_dismissal_pattern');
  });

  it('eligible when user reports task too big', () => {
    const result = isRescueEligible({
      userId: 'u1', lane: 'deep_creative', completedSessions: 3, daysSinceOnboarding: 2,
      abandonedSessionExists: false, missedPlannedSession: false, recentDismissals: 0,
      streakAtRisk: false, hoursUntilStreakBreak: 24, hasActiveSession: false,
      userTooBig: true, now: 100,
    });
    expect(result.eligible).toBe(true);
    expect(result.trigger).toBe('user_too_big');
  });
});

describe('Phase 17 — Rescue: Creates 5–12 minute session', () => {
  it.each(ALL_LANES)('%s rescue plan duration 5-12 min', (lane) => {
    const plan = createRescuePlan({ userId: 'u1', lane, reason: 'unclear' });
    expect(plan.durationSeconds).toBeGreaterThanOrEqual(5 * 60);
    expect(plan.durationSeconds).toBeLessThanOrEqual(12 * 60);
  });

  it('respects lane-specific duration defaults', () => {
    expect(createRescuePlan({ userId: 'u1', lane: 'student', reason: 'unclear' }).durationSeconds).toBe(8 * 60);
    expect(createRescuePlan({ userId: 'u1', lane: 'game_like', reason: 'unclear' }).durationSeconds).toBe(10 * 60);
    expect(createRescuePlan({ userId: 'u1', lane: 'deep_creative', reason: 'unclear' }).durationSeconds).toBe(7 * 60);
    expect(createRescuePlan({ userId: 'u1', lane: 'minimal_normal', reason: 'unclear' }).durationSeconds).toBe(5 * 60);
  });
});

describe('Phase 17 — Rescue: Stores memory', () => {
  it.each(ALL_LANES)('%s rescue stores completion memory', (lane) => {
    const plan = createRescuePlan({ userId: 'u1', lane, reason: 'tired' });
    const memory = buildRescueCompletionMemory(plan, 'completed');
    expect(memory.source).toBe('rescue_completion');
    expect(memory.text.length).toBeGreaterThan(0);
    expect(memory.confidence).toBeGreaterThan(0);
  });
});

describe('Phase 17 — Rescue: Lane-specific copy', () => {
  it('student rescue references notes', () => {
    expect(createRescuePlan({ userId: 'u1', lane: 'student', reason: 'too_big' }).taskDescription).toMatch(/notes/i);
  });
  it('game_like rescue references encounter', () => {
    expect(createRescuePlan({ userId: 'u1', lane: 'game_like', reason: 'too_big' }).taskDescription).toMatch(/Recovery encounter/i);
  });
  it('deep_creative rescue references project', () => {
    expect(createRescuePlan({ userId: 'u1', lane: 'deep_creative', reason: 'too_big' }).taskDescription).toMatch(/project/i);
  });
});

describe('Phase 17 — Rescue: Push eligibility', () => {
  it('sends push when eligible', () => {
    const eligibility = isRescueEligible({
      userId: 'u1', lane: 'student', completedSessions: 3, daysSinceOnboarding: 2,
      abandonedSessionExists: true, missedPlannedSession: false, recentDismissals: 0,
      streakAtRisk: false, hoursUntilStreakBreak: 24, hasActiveSession: false, now: 100,
    });
    const result = shouldSendRescuePush({
      eligibility, userMuted: false, quietHoursActive: false,
      budgetRemaining: 1, sentToday: 0, maxDaily: 2,
    });
    expect(result).toBe(true);
  });

  it('blocks push when user muted', () => {
    const eligibility = isRescueEligible({
      userId: 'u1', lane: 'student', completedSessions: 3, daysSinceOnboarding: 2,
      abandonedSessionExists: true, missedPlannedSession: false, recentDismissals: 0,
      streakAtRisk: false, hoursUntilStreakBreak: 24, hasActiveSession: false, now: 100,
    });
    const result = shouldSendRescuePush({
      eligibility, userMuted: true, quietHoursActive: false,
      budgetRemaining: 1, sentToday: 0, maxDaily: 2,
    });
    expect(result).toBe(false);
  });

  it('blocks push during quiet hours', () => {
    const eligibility = isRescueEligible({
      userId: 'u1', lane: 'student', completedSessions: 3, daysSinceOnboarding: 2,
      abandonedSessionExists: true, missedPlannedSession: false, recentDismissals: 0,
      streakAtRisk: false, hoursUntilStreakBreak: 24, hasActiveSession: false, now: 100,
    });
    const result = shouldSendRescuePush({
      eligibility, userMuted: false, quietHoursActive: true,
      budgetRemaining: 1, sentToday: 0, maxDaily: 2,
    });
    expect(result).toBe(false);
  });
});
