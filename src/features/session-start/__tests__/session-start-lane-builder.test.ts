/**
 * Tests for session-start lane-builder.
 */

import { buildLaneSessionBrief, buildFocusModeCards } from '../lane-builder';

describe('session-start: lane-builder', () => {
  describe('buildLaneSessionBrief', () => {
    it('builds a student lane brief', () => {
      const brief = buildLaneSessionBrief({ lane: 'student' });
      expect(brief.lane).toBe('student');
      expect(brief.userFacingModeName).toBe('Study');
      expect(brief.title).toContain('Study');
    });

    it('builds a game_like lane brief', () => {
      const brief = buildLaneSessionBrief({ lane: 'game_like' });
      expect(brief.lane).toBe('game_like');
      expect(brief.userFacingModeName).toBe('Run');
    });

    it('builds a deep_creative lane brief', () => {
      const brief = buildLaneSessionBrief({ lane: 'deep_creative' });
      expect(brief.lane).toBe('deep_creative');
      expect(brief.userFacingModeName).toBe('Project');
    });

    it('builds a minimal_normal lane brief (default)', () => {
      const brief = buildLaneSessionBrief({});
      expect(brief.lane).toBe('minimal_normal');
      expect(brief.userFacingModeName).toBe('Clean');
    });

    it('uses laneProfile primaryLane when provided', () => {
      const brief = buildLaneSessionBrief({
        laneProfile: { primaryLane: 'student' } as unknown,
      });
      expect(brief.lane).toBe('student');
    });

    it('caps rescue duration between 5 and 12 minutes', () => {
      const short = buildLaneSessionBrief({ isRescue: true, durationSeconds: 60 });
      expect(short.suggestedDurationSeconds).toBe(300); // 5 min minimum

      const long = buildLaneSessionBrief({ isRescue: true, durationSeconds: 60 * 60 });
      expect(long.suggestedDurationSeconds).toBe(720); // 12 min max
    });

    it('clamps normal duration between 15 and 90 minutes', () => {
      const short = buildLaneSessionBrief({ durationSeconds: 120 });
      expect(short.suggestedDurationSeconds).toBe(900); // 15 min minimum

      const long = buildLaneSessionBrief({ durationSeconds: 120 * 60 });
      expect(long.suggestedDurationSeconds).toBe(5400); // 90 min max
    });

    it('sets risk and friction for rescue sessions', () => {
      const brief = buildLaneSessionBrief({ isRescue: true, lane: 'student' });
      expect(brief.risk).not.toBeNull();
      expect(brief.risk?.type).toBe('avoidance');
      expect(brief.friction).not.toBeNull();
      expect(brief.friction?.level).toBe('soft');
    });

    it('sets risk and friction to null for normal sessions', () => {
      const brief = buildLaneSessionBrief({ lane: 'student' });
      expect(brief.risk).toBeNull();
      expect(brief.friction).toBeNull();
    });

    it('includes offlineMessage when offline', () => {
      const brief = buildLaneSessionBrief({ isOffline: true });
      expect(brief.offlineMessage).toBeTruthy();
    });

    it('sets offlineMessage to null when online', () => {
      const brief = buildLaneSessionBrief({ isOffline: false });
      expect(brief.offlineMessage).toBeNull();
    });
  });

  describe('buildFocusModeCards', () => {
    it('returns 4 cards for sprint, light-focus, study, recovery', () => {
      const cards = buildFocusModeCards({ streakDays: 0 });
      expect(cards).toHaveLength(4);
      expect(cards.map((c) => c.mode)).toEqual([
        'SPRINT',
        'LIGHT_FOCUS',
        'STUDY',
        'RECOVERY',
      ]);
    });

    it('includes streak-aware copy when streakDays > 0', () => {
      const cards = buildFocusModeCards({ streakDays: 5 });
      const lightFocus = cards.find((c) => c.mode === 'LIGHT_FOCUS');
      expect(lightFocus?.body).toContain('5');
    });

    it('includes day-zero copy when streakDays is 0', () => {
      const cards = buildFocusModeCards({ streakDays: 0 });
      const lightFocus = cards.find((c) => c.mode === 'LIGHT_FOCUS');
      expect(lightFocus?.body).toContain('first real proof');
    });

    it('every card has a valid durationSeconds', () => {
      const cards = buildFocusModeCards({ streakDays: 3 });
      for (const card of cards) {
        expect(card.durationSeconds).toBeGreaterThanOrEqual(60);
        expect(card.durationSeconds).toBeLessThanOrEqual(3600);
      }
    });

    it('every card has accessibility labels', () => {
      const cards = buildFocusModeCards({ streakDays: 0 });
      for (const card of cards) {
        expect(card.accessibilityLabel.length).toBeGreaterThan(0);
        expect(card.accessibilityHint.length).toBeGreaterThan(0);
      }
    });
  });
});
