import { getCoachPresenceMessage } from '../copy-service';
import type { CoachPresenceContext } from '../copy-service';

function makeContext(
  overrides: Partial<CoachPresenceContext> = {},
): CoachPresenceContext {
  return {
    aiAvailable: true,
    bossIntensity: null,
    comebackState: null,
    completionContext: null,
    firstWeekStage: null,
    latestSession: null,
    memoryConfidence: 'none',
    motivationStyle: 'CALM',
    premiumMoment: null,
    primaryGoal: 'focus',
    sessionMode: 'inactive',
    studyLayerLabel: null,
    ...overrides,
  };
}

describe('Phase 5 coach truth policy', () => {
  it('Day 0 Coach does not claim memory', () => {
    const result = getCoachPresenceMessage(makeContext());

    expect(result.displayMode).toBe('welcome');
    expect(result.message).not.toMatch(/I noticed|Your last session|usually/i);
  });

  it('after session 1 Coach references actual session', () => {
    const result = getCoachPresenceMessage(
      makeContext({
        latestSession: {
          durationMinutes: 31,
          focusPurityScore: 88,
          isComeback: false,
          mode: 'FOCUS',
        },
        memoryConfidence: 'weak',
      }),
    );

    expect(result.message).toContain('Your last session');
    expect(result.message).toContain('31 min');
    expect(result.message).toContain('88 focus');
  });

  it('does not say usually before 3 sessions', () => {
    const result = getCoachPresenceMessage(
      makeContext({
        latestSession: {
          durationMinutes: 16,
          focusPurityScore: 72,
          isComeback: false,
          mode: 'FOCUS',
        },
        memoryConfidence: 'weak',
      }),
    );

    expect(result.message).not.toMatch(/usually/i);
  });

  it('memory unavailable uses basic fallback', () => {
    const result = getCoachPresenceMessage(makeContext({ aiAvailable: false }));

    expect(result.message).toContain('offline');
    expect(result.message).not.toMatch(/I noticed|usually|Your last session/i);
  });

  it('does not interrupt active calm session', () => {
    const result = getCoachPresenceMessage(
      makeContext({
        memoryConfidence: 'medium',
        sessionMode: 'active_focus',
      }),
    );

    expect(result.shouldShow).toBe(false);
    expect(result.displayMode).toBe('quiet');
  });

  it('loading copy does not appear during active focus', () => {
    const result = getCoachPresenceMessage(
      makeContext({
        memoryConfidence: 'strong',
        sessionMode: 'active_focus',
      }),
    );

    expect(result.message).not.toMatch(/loading|thinking|spinner/i);
  });

  it('copy adapts by motivation style', () => {
    const calm = getCoachPresenceMessage(
      makeContext({ motivationStyle: 'CALM' }),
    );
    const game = getCoachPresenceMessage(
      makeContext({ motivationStyle: 'GAME_LIKE' }),
    );

    expect(calm.tone).toBe('calm');
    expect(game.tone).toBe('playful');
    expect(calm.message).not.toBe(game.message);
  });
});
