/**
 * VexAction Boundary Tests
 *
 * Phase 3 test requirements:
 * 1. Actions validate input via Zod schema
 * 2. Actions fail safely (return VexActionResult, never throw)
 * 3. Actions respect FeatureAvailability gate
 * 4. Actions do not expose hidden systems (no direct Supabase, no UI)
 * 5. Actions do not fake AI output (pure compute or repository-backed)
 */

import { describe, expect, it, jest } from '@jest/globals';
import {
  vexCompleteReflection,
  vexCreateFocusSession,
  vexStartSession,
  vexStartRescue,
  vexUpdateLaneOverride,
} from '../service';
import { checkFeatureGate, getActionFeatureKey } from '../action-utils';
import type { ActionGate } from '../action-utils';

// ============================================================================
// Mock feature services to avoid repository calls
// ============================================================================

jest.mock('../../focus-run/service', () => ({
  recordFocusRunEvent: jest.fn().mockResolvedValue({
    id: 'run-1',
    userId: 'u1',
    weekStartsAt: 0,
    status: 'active',
    bossId: null,
    modifiers: [],
    completedEncounters: 1,
    cleanStarts: 1,
    recoveryWins: 0,
    reflectionUpgrades: 0,
    finalGrade: null,
    events: [],
  }),
  buildFocusRunDisplay: jest.fn().mockReturnValue({
    laneAllowed: true,
    title: 'test',
    body: 'test',
    boss: { name: 'Test', archetype: 'cold_start_shadow' as const, evidenceCount: 0, isTeaser: true, isEvidenceBased: false, observedDays: 0, recoveryPrompt: 'test' },
    nextAction: 'test',
    modifiers: [],
    completedEncounters: 0,
    cleanStarts: 0,
    recoveryWins: 0,
    reflectionUpgrades: 0,
    finalGrade: null,
    weekSummary: 'test',
  }),
}));

jest.mock('../../study-os/service', () => ({
  createManualStudyPlan: jest.fn().mockResolvedValue({
    id: 'plan-1',
    userId: 'u1',
    title: 'Test Plan',
    blocks: [],
    reviewItems: [],
    source: { id: 's1', title: 'Test', type: 'manual', userId: 'u1', createdAt: 0, extractedTextStatus: 'none' },
    status: 'active',
    createdAt: 0,
    deadlineAt: null,
  }),
}));

jest.mock('../../project-focus/service', () => ({
  completeProjectSession: jest.fn().mockResolvedValue({
    id: 'thread-1',
    userId: 'u1',
    projectTitle: 'Test',
    currentObjective: 'Test objective',
    nextMove: 'Test move',
    lastSessionSummary: 'ok',
    blocker: null,
    handoffNote: null,
    openQuestions: [],
    state: 'active',
    staleRisk: 'none',
    bestSessionMode: 'CREATIVE',
    lastTouched: 0,
    rescuedAt: null,
  }),
}));

jest.mock('../../focus-memory/service', () => ({
  findMemoriesForRecommendation: jest.fn().mockResolvedValue([]),
}));

// ============================================================================
// Test data
// ============================================================================

const GATE_OPEN: ActionGate = { isAvailable: true, reason: 'available' };
const GATE_CLOSED: ActionGate = { isAvailable: false, reason: 'feature is disabled' };

const validCreateFocusSession = {
  userId: 'u1',
  durationMinutes: 25,
  category: 'focus',
};

const validStartSession = {
  userId: 'u1',
  lane: 'minimal_normal' as const,
  durationSeconds: 1500,
};

const validStartRescue = {
  userId: 'u1',
  lane: 'student' as const,
  reason: 'unclear' as const,
};

const validUpdateLaneOverride = {
  userId: 'u1',
  manualOverride: 'deep_creative' as const,
};

const validCompleteReflection = {
  userId: 'u1',
  lane: 'student' as const,
  reflectionAnswer: 'I stayed focused',
  isComeback: false,
  summary: {
    sessionId: 's1',
    effectiveDuration: 1500,
    completionPercentage: 100,
    interruptions: 0,
    sessionMode: 'STUDY',
    status: 'COMPLETED',
  },
};

// ============================================================================
// Test Suite
// ============================================================================

describe('VexAction Boundaries', () => {
  // ─── Gate System ────────────────────────────────────────────────────────

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

  // ─── 1. create_focus_session ────────────────────────────────────────────

  describe('create_focus_session', () => {
    it('returns success with valid input', () => {
      const result = vexCreateFocusSession(validCreateFocusSession, GATE_OPEN);
      expect(result.status).toBe('success');
      expect(result.data).not.toBeNull();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = result.data as any;
      expect(data.duration).toBe(1500); // 25 min * 60
      expect(data.mode).toBe('STARTER');
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
      const result = vexCreateFocusSession(validCreateFocusSession, GATE_CLOSED);
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

  // ─── 2. start_session ───────────────────────────────────────────────────

  describe('start_session', () => {
    it('returns success with valid input', () => {
      const result = vexStartSession(validStartSession, GATE_OPEN);
      expect(result.status).toBe('success');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = result.data as any;
      expect(data.lane).toBe('minimal_normal');
      expect(data.userFacingModeName).toBe('Clean');
      expect(data.ctaLabel).toBeTruthy();
      expect(data.successCondition).toBeTruthy();
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((student.data as any).sessionMode).not.toBe((game.data as any).sessionMode);
    });
  });

  // ─── 3. complete_reflection ─────────────────────────────────────────────

  describe('complete_reflection', () => {
    it('returns success with valid input', () => {
      const result = vexCompleteReflection(
        validCompleteReflection,
        GATE_OPEN,
      );
      expect(result.status).toBe('success');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((result.data as any).reflectionQuestion).toBeTruthy();
    });

    it('fails validation with invalid summary shape', () => {
      const result = vexCompleteReflection(
        {
          ...validCompleteReflection,
          summary: { bad: 'shape' },
        },
        GATE_OPEN,
      );
      expect(result.status).toBe('validation_error');
    });

    it('is blocked when gate is closed', () => {
      const result = vexCompleteReflection(validCompleteReflection, GATE_CLOSED);
      expect(result.status).toBe('feature_blocked');
    });

    it('does not expose hidden feature keys in output', () => {
      const result = vexCompleteReflection(
        { ...validCompleteReflection, lane: 'game_like' },
        GATE_OPEN,
      );
      // Unlock decision should never show blocked system internals
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unlock = (result.data as any).unlockDecision;
      expect(unlock).toBeTruthy();
      expect(unlock.status).not.toBe('available'); // not auto-unlocked
    });
  });

  // ─── 4. start_rescue ────────────────────────────────────────────────────

  describe('start_rescue', () => {
    it('returns success with valid input', () => {
      const result = vexStartRescue(validStartRescue, GATE_OPEN);
      expect(result.status).toBe('success');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = result.data as any;
      expect(data.lane).toBe('student');
      expect(data.reason).toBe('unclear');
      expect(data.durationSeconds).toBeGreaterThanOrEqual(5 * 60);
      expect(data.durationSeconds).toBeLessThanOrEqual(12 * 60);
    });

    it('fails validation on bad reason', () => {
      const result = vexStartRescue(
        { ...validStartRescue, reason: 'not_a_reason' },
        GATE_OPEN,
      );
      expect(result.status).toBe('validation_error');
    });

    it('respects duration clamping (5-12 min max range)', () => {
      const tooShort = vexStartRescue(
        { ...validStartRescue, durationSeconds: 60 },
        GATE_OPEN,
      );
      // createRescuePlan clamps to 5*60 min; 60 input → 5*60 output
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((tooShort.data as any).durationSeconds).toBeGreaterThanOrEqual(5 * 60);
    });

    it('is blocked when gate is closed', () => {
      const result = vexStartRescue(validStartRescue, GATE_CLOSED);
      expect(result.status).toBe('feature_blocked');
    });
  });

  // ─── 9. update_lane_override ────────────────────────────────────────────

  describe('update_lane_override', () => {
    it('returns success with valid manual override', () => {
      const result = vexUpdateLaneOverride(validUpdateLaneOverride);
      expect(result.status).toBe('success');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = result.data as any;
      expect(data.primaryLane).toBe('deep_creative');
      expect(data.source).toBe('manual_override');
      expect(data.confidence).toBe(1);
    });

    it('fails validation on invalid lane', () => {
      const result = vexUpdateLaneOverride({
        ...validUpdateLaneOverride,
        manualOverride: 'bad_lane',
      });
      expect(result.status).toBe('validation_error');
    });

    it('always available — not blocked even without gate param', () => {
      const result = vexUpdateLaneOverride(validUpdateLaneOverride);
      expect(result.status).toBe('success');
      expect(result.status).not.toBe('feature_blocked');
    });

    it('does not expose other users data', () => {
      const result = vexUpdateLaneOverride(validUpdateLaneOverride);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = result.data as any;
      expect(data).not.toHaveProperty('otherUsers');
      expect(data).not.toHaveProperty('allProfiles');
    });
  });

  // ─── Cross-cutting Safety Tests ─────────────────────────────────────────

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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data = result.data as any;
          expect(data).not.toHaveProperty('ai_generated');
          expect(data).not.toHaveProperty('llm_response');
          expect(data).not.toHaveProperty('model_name');
        }
      });
    }
  });

  // ─── Feature Gating Integrity ──────────────────────────────────────────

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
