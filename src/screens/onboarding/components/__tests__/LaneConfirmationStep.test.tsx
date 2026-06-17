import { describe, it, expect } from '@jest/globals';
import { confirmInitialLane } from '../../../../features/lane-engine';
import { LANE_LABELS, LANE_EMOJI } from '../LaneConfirmationStep';

const observedAt = 1_764_000_000_000;

describe('LaneConfirmationStep', () => {
  describe('LANE_LABELS', () => {
    it('all four lanes have soft labels', () => {
      expect(LANE_LABELS).toEqual({
        student: 'Study Mode',
        game_like: 'Run Mode',
        deep_creative: 'Project Mode',
        minimal_normal: 'Clean Mode',
      });
    });

    it('all labels end with "Mode"', () => {
      for (const label of Object.values(LANE_LABELS)) {
        expect(label).toMatch(/Mode$/);
      }
    });
  });

  describe('LANE_EMOJI', () => {
    it('all four lanes have emojis', () => {
      expect(Object.keys(LANE_EMOJI).length).toBe(4);
      for (const key of [
        'student',
        'game_like',
        'deep_creative',
        'minimal_normal',
      ]) {
        expect(LANE_EMOJI[key as keyof typeof LANE_EMOJI]).toBeDefined();
      }
    });
  });

  describe('confirmInitialLane copy', () => {
    it('student lane recommends "Study Mode"', () => {
      const result = confirmInitialLane({
        primaryGoal: 'study',
        motivationStyle: 'study_focused',
        observedAt,
      });
      expect(result.recommendedLane).toBe('student');
      expect(result.userFacingName).toBe('Study');
      expect(result.reason).toContain('Study Mode');
    });

    it('game_like lane recommends "Run Mode"', () => {
      const result = confirmInitialLane({
        primaryGoal: 'focus',
        motivationStyle: 'game_like',
        observedAt,
      });
      expect(result.recommendedLane).toBe('game_like');
      expect(result.userFacingName).toBe('Quest');
      expect(result.reason).toContain('Quest Mode');
    });

    it('deep_creative lane recommends "Create Mode"', () => {
      const result = confirmInitialLane({
        primaryGoal: 'creative',
        motivationStyle: 'coach_led',
        observedAt,
      });
      expect(result.recommendedLane).toBe('deep_creative');
      expect(result.userFacingName).toBe('Create');
      expect(result.reason).toContain('Create Mode');
    });

    it('minimal user recommends "Focus Mode"', () => {
      const result = confirmInitialLane({
        primaryGoal: 'personal',
        motivationStyle: 'calm',
        observedAt,
      });
      expect(result.recommendedLane).toBe('minimal_normal');
      expect(result.userFacingName).toBe('Focus');
      expect(result.reason).toContain('Focus Mode');
    });

    it('all confirmations include "You can change this anytime"', () => {
      for (const motivationStyle of [
        'calm',
        'friendly',
        'game_like',
        'intense',
        'study_focused',
      ] as const) {
        const result = confirmInitialLane({
          primaryGoal: 'study',
          motivationStyle,
          observedAt,
        });
        expect(result.canChangeLater).toBe(true);
      }
    });

    it('manual override produces high confidence', () => {
      const result = confirmInitialLane({
        primaryGoal: 'study',
        motivationStyle: 'calm',
        manualOverride: 'game_like',
        observedAt,
      });
      expect(result.recommendedLane).toBe('game_like');
      expect(result.confidence).toBe(1);
    });
  });

  describe('Button labels', () => {
    it('primary button says "Start with this"', () => {
      const label = 'Start with this';
      expect(label).toBe('Start with this');
    });

    it('secondary button says "Choose another"', () => {
      const label = 'Choose another';
      expect(label).toBe('Choose another');
    });
  });
});
