import {
  describe,
  expect,
  it,
  checkFeatureGate,
  getActionFeatureKey,
  GATE_OPEN,
  GATE_CLOSED,
} from './helpers';

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
});
