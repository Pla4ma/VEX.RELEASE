import {
  describe,
  expect,
  it,
  vexCreateFocusSession,
  GATE_OPEN,
  GATE_CLOSED,
  validCreateFocusSession,
} from './helpers';

describe('VexAction Boundaries', () => {
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
});
