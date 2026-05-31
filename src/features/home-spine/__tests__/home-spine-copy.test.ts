/**
 * Tests for home-spine copy.ts
 * (buildDisplayedReturnReason, buildPrimaryAction, buildProgressSignal,
 *  recommendationTitleMap)
 */

import {
  buildDisplayedReturnReason,
  buildPrimaryAction,
  buildProgressSignal,
  recommendationTitleMap,
} from '../copy';
import type { HomeReturnReasonState } from '../schemas';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeReturnReason(
  overrides: Partial<HomeReturnReasonState> = {},
): HomeReturnReasonState {
  return {
    eyebrow: 'Return reason',
    title: 'Start focus',
    body: 'Description',
    ctaLabel: 'Start',
    intent: 'start-session',
    source: 'next-best-action',
    tone: 'default',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// copy.ts tests
// ---------------------------------------------------------------------------
describe('home-spine: copy', () => {
  describe('buildDisplayedReturnReason', () => {
    it('returns returnReason unchanged when homeHighlight is null', () => {
      const rr = makeReturnReason();
      const result = buildDisplayedReturnReason(null, rr);
      expect(result).toEqual(rr);
    });

    it('overrides title, body, tone, source when homeHighlight is present', () => {
      const result = buildDisplayedReturnReason(
        {
          title: 'Victory!',
          message: 'You crushed it.',
          tone: 'celebration',
        },
        makeReturnReason(),
      );
      expect(result.title).toBe('Victory!');
      expect(result.body).toBe('You crushed it.');
      expect(result.tone).toBe('celebration');
      expect(result.source).toBe('completion-highlight');
    });
  });

  describe('buildPrimaryAction', () => {
    it('returns first-run copy when isFirstRun', () => {
      const result = buildPrimaryAction({
        currentStreak: 0,
        isAtRisk: false,
        isFirstRun: true,
      });
      expect(result.title).toContain('first');
      expect(result.ctaLabel).toContain('first');
    });

    it('returns at-risk copy when isAtRisk', () => {
      const result = buildPrimaryAction({
        currentStreak: 3,
        isAtRisk: true,
        isFirstRun: false,
      });
      expect(result.title).toContain('streak');
      expect(result.ctaLabel).toContain('Protect');
    });

    it('returns streak-positive copy when streak > 0', () => {
      const result = buildPrimaryAction({
        currentStreak: 5,
        isAtRisk: false,
        isFirstRun: false,
      });
      expect(result.body).toContain('Keep the loop easy');
    });

    it('returns zero-streak copy when streak is 0', () => {
      const result = buildPrimaryAction({
        currentStreak: 0,
        isAtRisk: false,
        isFirstRun: false,
      });
      expect(result.body).toContain('clean default');
    });
  });

  describe('buildProgressSignal', () => {
    it('returns first-run signal when isFirstRun', () => {
      const result = buildProgressSignal({
        isAtRisk: false,
        isFirstRun: true,
        level: 1,
        progressPercent: 0,
        progressXp: 0,
        todayFocusMinutes: 0,
      });
      expect(result.title).toContain('unlocks after session one');
    });

    it("returns 'already banked' when daily anchor reached", () => {
      const result = buildProgressSignal({
        isAtRisk: false,
        isFirstRun: false,
        level: 5,
        progressPercent: 100,
        progressXp: 2000,
        todayFocusMinutes: 120,
      });
      expect(result.title).toContain('already has a real focus win');
    });

    it('returns partial-progress signal when some focus done', () => {
      const result = buildProgressSignal({
        isAtRisk: false,
        isFirstRun: false,
        level: 3,
        progressPercent: 50,
        progressXp: 1000,
        todayFocusMinutes: 45,
      });
      expect(result.title).toContain('banked');
      expect(result.body).toContain('remain');
    });

    it('returns at-risk signal when no focus and at-risk', () => {
      const result = buildProgressSignal({
        isAtRisk: true,
        isFirstRun: false,
        level: 2,
        progressPercent: 0,
        progressXp: 500,
        todayFocusMinutes: 0,
      });
      expect(result.title).toContain('streak');
    });

    it('returns default anchor signal when no focus and not at-risk', () => {
      const result = buildProgressSignal({
        isAtRisk: false,
        isFirstRun: false,
        level: 1,
        progressPercent: 0,
        progressXp: 0,
        todayFocusMinutes: 0,
      });
      expect(result.title).toContain('anchor');
    });
  });

  describe('recommendationTitleMap', () => {
    it('has an entry for every recommendation type', () => {
      const types = [
        'OPTIMAL_TIME',
        'STREAK_PROTECTION',
        'COMEBACK_BUILDER',
        'DIFFICULTY_ADJUST',
        'CHALLENGE_SYNC',
        'BOSS_PREP',
        'HABIT_BUILDER',
        'ENERGY_BASED',
      ];
      for (const t of types) {
        expect(recommendationTitleMap[t as keyof typeof recommendationTitleMap]).toBeTruthy();
      }
    });
  });
});
