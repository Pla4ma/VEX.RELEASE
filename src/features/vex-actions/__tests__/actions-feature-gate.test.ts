import { describe, expect, it } from '@jest/globals';
import { vexCreateFocusSession, vexStartSession } from '../service';
import { checkFeatureGate, getActionFeatureKey } from '../action-utils';
import {
  GATE_OPEN,
  GATE_CLOSED,
  validCreateFocusSession,
  validStartSession,
  expectData,
} from './actions-helpers';

describe('VexAction Boundaries', () => {
  describe('Feature Gate System', () => {
    it('returns null for lane override (no gate needed)', () => {
      const result = checkFeatureGate('update_lane_override', null);
      expect(result).toBeNull();
    });

    it('returns blocked result when gate is closed', () => {
      const result = checkFeatureGate('start_session', GATE_CLOSED);
      expect(result).not.toBeNull();
      expect(result!.status).toBe('feature_blocked');
      expect(result!.errorMessage).toContain('disabled');
    });

    it('returns null when gate is open', () => {
      const result = checkFeatureGate('start_session', GATE_OPEN);
      expect(result).toBeNull();
    });

    it('maps each action to correct feature key', () => {
      expect(getActionFeatureKey('create_focus_session')).toBe('focus_session');
      expect(getActionFeatureKey('create_study_block')).toBe('content_study');
      expect(getActionFeatureKey('read_memory_summary')).toBe('focus_memory');
      expect(getActionFeatureKey('update_lane_override')).toBeNull();
    });
  });

  describe('create_focus_session', () => {
    it('returns success with valid input', () => {
      const result = vexCreateFocusSession(validCreateFocusSession, GATE_OPEN);
      expect(result.status).toBe('success');
      expect(result.data).not.toBeNull();
      expect(result.data).toHaveProperty('duration', 1500);
      expect(result.data).toHaveProperty('mode', 'STARTER');
    });

    it('fails validation on negative duration', () => {
      const result = vexCreateFocusSession(
        { ...validCreateFocusSession, durationMinutes: 0 },
        GATE_OPEN,
      );
      expect(result.status).toBe('validation_error');
      expect(result.errorMessage).toContain('create_focus_session');
    });

    it('is blocked when feature gate is closed', () => {
      const result = vexCreateFocusSession(
        validCreateFocusSession,
        GATE_CLOSED,
      );
      expect(result.status).toBe('feature_blocked');
      expect(result.data).toBeNull();
    });

    it('does not expose any secret systems', () => {
      const result = vexCreateFocusSession(validCreateFocusSession, GATE_OPEN);
      expect(result.data).not.toHaveProperty('ai_generated');
      expect(result.data).not.toHaveProperty('agent_prompt');
      expect(result.data).not.toHaveProperty('supabase_key');
    });
  });

  describe('start_session', () => {
    it('returns success with valid input', () => {
      const result = vexStartSession(validStartSession, GATE_OPEN);
      expect(result.status).toBe('success');
      expect(result.data).toHaveProperty('lane', 'minimal_normal');
      expect(result.data).toHaveProperty('userFacingModeName', 'Clean');
      expect(result.data).toHaveProperty('ctaLabel');
      expect(result.data).toHaveProperty('successCondition');
    });

    it('fails validation on invalid lane', () => {
      const result = vexStartSession(
        { ...validStartSession, lane: 'invalid' },
        GATE_OPEN,
      );
      expect(result.status).toBe('validation_error');
    });

    it('is blocked when gate is closed', () => {
      const result = vexStartSession(validStartSession, GATE_CLOSED);
      expect(result.status).toBe('feature_blocked');
    });

    it('generates lane-adaptive output (not static)', () => {
      const student = vexStartSession(
        { ...validStartSession, lane: 'student' },
        GATE_OPEN,
      );
      const game = vexStartSession(
        { ...validStartSession, lane: 'game_like' },
        GATE_OPEN,
      );
      expect(expectData(student.data, 'sessionMode')).not.toBe(
        expectData(game.data, 'sessionMode'),
      );
    });
  });
});
