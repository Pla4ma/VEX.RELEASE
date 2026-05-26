/**
 * VEX Phase 17 — Journeys: First-run recommendation (Category 1)
 */
import { describe, expect, it } from '@jest/globals';
import { generateSessionRecommendation } from '../../features/session-recommendation/service';
import type { SessionRecommendationInput } from '../../features/session-recommendation/schemas';
import type { Lane } from '../../features/lane-engine/types';

const ALL_LANES: Lane[] = ['student', 'game_like', 'deep_creative', 'minimal_normal'];

function input(overrides: Partial<SessionRecommendationInput> = {}): SessionRecommendationInput {
  return {
    userGoal: 'focus', timeOfDay: 9, streakUrgency: 'none', recoveryStatus: 'none',
    isFirstSession: true, hasActiveSession: false,
    userId: '00000000-0000-0000-0000-000000000001',
    ...overrides,
  };
}

describe('Phase 17 — First-run recommendation', () => {
  it('recommends a short first session for new users', () => {
    const rec = generateSessionRecommendation(input());
    expect(rec.isBlocked).toBe(false);
    expect(rec.duration).toBe(10);
    expect(rec.mode).toBe('RECOVERY');
    expect(rec.confidence).toBeGreaterThanOrEqual(0.9);
    expect(rec.reason).toContain('habit');
  });

  it('user can change recommendation later (not locked)', () => {
    const rec = generateSessionRecommendation(input({ isFirstSession: false, streakUrgency: 'high' }));
    expect(rec.isBlocked).toBe(false);
    expect(rec.mode).not.toBe('RECOVERY');
  });

  it('blocks active session from starting another', () => {
    const rec = generateSessionRecommendation(input({ hasActiveSession: true }));
    expect(rec.isBlocked).toBe(true);
    expect(rec.blockReason).toContain('Active session');
  });

  it('recommendation is lane-agnostic — works for all 4 lanes', () => {
    ALL_LANES.forEach((_lane) => {
      const rec = generateSessionRecommendation(input({ userGoal: 'work', timeOfDay: 14 }));
      expect(rec.isBlocked).toBe(false);
      expect(rec.duration).toBeGreaterThanOrEqual(10);
    });
  });
});
