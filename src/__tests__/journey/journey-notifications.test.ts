/**
 * VEX Phase 17 — Journeys: Notifications (Category 8)
 */
import { describe, expect, it } from '@jest/globals';
import { decideNudge } from '../../features/notification-policy/service';
import type { Lane } from '../../features/lane-engine/types';

const ALL_LANES: Lane[] = [
  'student',
  'game_like',
  'deep_creative',
  'minimal_normal',
];

describe('Phase 17 — Notifications: Day 0 no unsolicited', () => {
  it.each(ALL_LANES)('blocks unsolicited nudges on Day 0 for %s', (lane) => {
    const d = decideNudge({
      lane,
      completedSessions: 0,
      daysSinceOnboarding: 0,
    });
    expect(d.allowed).toBe(false);
    expect(d.reason).toContain('Day 0');
    expect(d.type).toBe('none');
  });
});

describe('Phase 17 — Notifications: Dismissal lowers priority', () => {
  it('recentDismissals >= 2 suppresses low-trust nudges', () => {
    const d = decideNudge({
      lane: 'student',
      completedSessions: 4,
      daysSinceOnboarding: 3,
      recentDismissals: 2,
    });
    expect(d.allowed).toBe(false);
    expect(d.reason).toContain('suppress');
  });

  it('rescue still allowed with dismissals when context is avoidance', () => {
    const d = decideNudge({
      lane: 'game_like',
      completedSessions: 4,
      daysSinceOnboarding: 3,
      recentDismissals: 2,
      context: 'avoidance',
    });
    expect(d.allowed).toBe(true);
    expect(d.type).toBe('rescue');
  });
});

describe('Phase 17 — Notifications: Lane copy', () => {
  it('produces lane-specific copy', () => {
    const d = decideNudge({
      lane: 'student',
      completedSessions: 4,
      daysSinceOnboarding: 3,
      context: 'deadline',
    });
    expect(d.allowed).toBe(true);
    expect(d.title).toBeTruthy();
    expect(d.body).toBeTruthy();
  });

  it('clean lane nudge is gentle', () => {
    const d = decideNudge({
      lane: 'minimal_normal',
      completedSessions: 2,
      daysSinceOnboarding: 2,
    });
    expect(d.allowed).toBe(true);
    expect(d.title).toBe('One clean block');
  });
});

describe('Phase 17 — Notifications: Budget', () => {
  it('minimal_normal max 1/day', () => {
    const d = decideNudge({
      lane: 'minimal_normal',
      completedSessions: 3,
      daysSinceOnboarding: 2,
      sentToday: 1,
    });
    expect(d.allowed).toBe(false);
    expect(d.budgetRemaining).toBe(0);
  });

  it('other lanes max 2/day', () => {
    const d = decideNudge({
      lane: 'student',
      completedSessions: 3,
      daysSinceOnboarding: 2,
      sentToday: 2,
    });
    expect(d.allowed).toBe(false);
    expect(d.budgetRemaining).toBe(0);
  });
});

describe('Phase 17 — Notifications: User mute + Quiet hours', () => {
  it('blocks when user muted', () => {
    const d = decideNudge({
      lane: 'student',
      completedSessions: 5,
      daysSinceOnboarding: 3,
      userMuted: true,
    });
    expect(d.allowed).toBe(false);
    expect(d.reason).toContain('mute');
  });

  it('blocks during quiet hours', () => {
    const d = decideNudge({
      lane: 'deep_creative',
      completedSessions: 3,
      daysSinceOnboarding: 2,
      quietHoursActive: true,
    });
    expect(d.allowed).toBe(false);
    expect(d.reason).toContain('Quiet hours');
  });
});
