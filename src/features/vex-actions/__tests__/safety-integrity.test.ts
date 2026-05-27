import {
  describe, expect, it,
  vexCompleteReflection, vexCreateFocusSession, vexStartSession,
  vexStartRescue, vexUpdateLaneOverride,
  GATE_OPEN, GATE_CLOSED,
  validCreateFocusSession, validStartSession, validStartRescue,
  validUpdateLaneOverride, validCompleteReflection,
} from './helpers';

describe('VexAction Boundaries', () => {
  describe('Safety Properties (all actions)', () => {
    const actions = [
      { name: 'create_focus_session', fn: () => vexCreateFocusSession(validCreateFocusSession, GATE_OPEN) },
      { name: 'start_session', fn: () => vexStartSession(validStartSession, GATE_OPEN) },
      { name: 'start_rescue', fn: () => vexStartRescue(validStartRescue, GATE_OPEN) },
      { name: 'update_lane_override', fn: () => vexUpdateLaneOverride(validUpdateLaneOverride) },
    ];

    for (const action of actions) {
      it(`${action.name}: never throws — always returns VexActionResult`, () => {
        let threw = false;
        try {
          action.fn();
        } catch {
          threw = true;
        }
        expect(threw).toBe(false);
        const result = action.fn();
        expect(result).toHaveProperty('status');
        expect(result).toHaveProperty('errorMessage');
        expect(result).toHaveProperty('data');
      });

      it(`${action.name}: result status is valid VexActionStatus`, () => {
        const result = action.fn();
        const validStatuses = ['success', 'validation_error', 'feature_blocked', 'repository_error', 'not_found', 'permission_denied'];
        expect(validStatuses).toContain(result.status);
      });

      it(`${action.name}: no direct Supabase call exposed in data`, () => {
        const result = action.fn();
        if (result.data) {
          const serialized = JSON.stringify(result.data);
          expect(serialized).not.toContain('supabase_key');
          expect(serialized).not.toContain('service_role');
          expect(serialized).not.toContain('anon_key');
        }
      });

      it(`${action.name}: no AI/LLM output claims`, () => {
        const result = action.fn();
        if (result.data) {
          expect(result.data).not.toHaveProperty('ai_generated');
          expect(result.data).not.toHaveProperty('llm_response');
          expect(result.data).not.toHaveProperty('model_name');
        }
      });
    }
  });

  describe('Feature Gating Integrity', () => {
    it('all gated actions are blocked with closed gate', () => {
      const gatedActions = [
        () => vexCreateFocusSession(validCreateFocusSession, GATE_CLOSED),
        () => vexStartSession(validStartSession, GATE_CLOSED),
        () => vexStartRescue(validStartRescue, GATE_CLOSED),
      ];

      for (const fn of gatedActions) {
        const result = fn();
        expect(result.status).toBe('feature_blocked');
      }
    });

    it('lane override is never blocked (always available)', () => {
      const result = vexUpdateLaneOverride(validUpdateLaneOverride, GATE_CLOSED);
      expect(result.status).toBe('success');
      expect(result.status).not.toBe('feature_blocked');
    });
  });
});
