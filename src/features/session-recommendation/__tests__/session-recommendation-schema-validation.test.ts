/**
 * Session Recommendation — Schema Validation Tests
 */

import {
  SessionModeSchema,
  SessionRecommendationSchema,
  SessionRecommendationInputSchema,
} from '../schemas';
import type { SessionRecommendation, SessionRecommendationInput } from '../schemas';

// ── Helpers ──────────────────────────────────────────────────────────

function makeInput(overrides: Partial<SessionRecommendationInput> = {}): SessionRecommendationInput {
  return SessionRecommendationInputSchema.parse({
    timeOfDay: 10,
    streakUrgency: 'none',
    recoveryStatus: 'none',
    isFirstSession: false,
    hasActiveSession: false,
    userId: '550e8400-e29b-41d4-a716-446655440000',
    ...overrides,
  });
}

function makeRecommendation(overrides: Partial<SessionRecommendation> = {}): SessionRecommendation {
  return SessionRecommendationSchema.parse({
    duration: 25,
    mode: 'FOCUS',
    reason: 'Test recommendation',
    fallback: false,
    inputs: makeInput(),
    confidence: 0.8,
    isBlocked: false,
    ...overrides,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SCHEMA VALIDATION
// ═══════════════════════════════════════════════════════════════════════

describe('SessionModeSchema', () => {
  it('accepts all valid modes', () => {
    const modes = ['FOCUS', 'RECOVERY', 'STUDY', 'BOSS_PREP', 'HABIT_BUILD'];
    for (const mode of modes) {
      expect(SessionModeSchema.parse(mode)).toBe(mode);
    }
  });

  it('rejects invalid mode', () => {
    expect(() => SessionModeSchema.parse('INVALID')).toThrow();
  });
});

describe('SessionRecommendationInputSchema', () => {
  it('accepts valid input with all required fields', () => {
    const input = makeInput();
    expect(input.timeOfDay).toBe(10);
    expect(input.streakUrgency).toBe('none');
    expect(input.recoveryStatus).toBe('none');
    expect(input.isFirstSession).toBe(false);
    expect(input.hasActiveSession).toBe(false);
  });

  it('rejects timeOfDay outside 0-23', () => {
    expect(() => makeInput({ timeOfDay: 24 })).toThrow();
    expect(() => makeInput({ timeOfDay: -1 })).toThrow();
  });

  it('rejects invalid streakUrgency value', () => {
    expect(() => makeInput({ streakUrgency: 'extreme' as 'none' })).toThrow();
  });

  it('rejects invalid recoveryStatus value', () => {
    expect(() => makeInput({ recoveryStatus: 'maybe' as 'none' })).toThrow();
  });

  it('rejects invalid UUID for userId', () => {
    expect(() => makeInput({ userId: 'not-a-uuid' })).toThrow();
  });

  it('accepts optional fields when provided', () => {
    const input = makeInput({
      userGoal: 'Study math',
      recentSessionLength: 30,
      recentGrade: 'A',
      dailyMissionType: 'boss-fight',
    });
    expect(input.userGoal).toBe('Study math');
    expect(input.recentSessionLength).toBe(30);
    expect(input.recentGrade).toBe('A');
    expect(input.dailyMissionType).toBe('boss-fight');
  });
});

describe('SessionRecommendationSchema', () => {
  it('accepts valid recommendation', () => {
    const rec = makeRecommendation();
    expect(rec.duration).toBe(25);
    expect(rec.mode).toBe('FOCUS');
    expect(rec.confidence).toBe(0.8);
  });

  it('rejects duration below 5', () => {
    expect(() => makeRecommendation({ duration: 4 })).toThrow();
  });

  it('rejects duration above 720', () => {
    expect(() => makeRecommendation({ duration: 721 })).toThrow();
  });

  it('rejects empty reason', () => {
    expect(() => makeRecommendation({ reason: '' })).toThrow();
  });

  it('rejects confidence above 1', () => {
    expect(() => makeRecommendation({ confidence: 1.1 })).toThrow();
  });

  it('rejects confidence below 0', () => {
    expect(() => makeRecommendation({ confidence: -0.1 })).toThrow();
  });

  it('accepts boundary duration values', () => {
    expect(makeRecommendation({ duration: 5 }).duration).toBe(5);
    expect(makeRecommendation({ duration: 720 }).duration).toBe(720);
  });
});
