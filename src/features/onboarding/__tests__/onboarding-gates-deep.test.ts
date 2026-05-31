/**
 * Deep Onboarding Tests — onboarding-gates & constants
 */

import {
  FEATURE_UNLOCK_GATES,
  STEP_CONTENT,
  STEP_ORDER,
} from '../onboarding-gates';

import { ONBOARDING_GOALS } from '../constants';

// ============================================================================
// onboarding-gates
// ============================================================================

describe('onboarding-gates', () => {
  describe('STEP_ORDER', () => {
    it('contains 7 steps in correct order', () => {
      expect(STEP_ORDER).toHaveLength(7);
      expect(STEP_ORDER[0]).toBe('WELCOME');
      expect(STEP_ORDER[1]).toBe('QUICK_START');
      expect(STEP_ORDER[2]).toBe('FIRST_SESSION');
      expect(STEP_ORDER[3]).toBe('POST_SESSION');
      expect(STEP_ORDER[4]).toBe('HOME_INTRO');
      expect(STEP_ORDER[5]).toBe('FEATURE_UNLOCK');
      expect(STEP_ORDER[6]).toBe('COMPLETE');
    });
  });

  describe('FEATURE_UNLOCK_GATES', () => {
    it('has 6 unlock gates', () => {
      expect(FEATURE_UNLOCK_GATES).toHaveLength(6);
    });

    it('each gate has required fields', () => {
      for (const gate of FEATURE_UNLOCK_GATES) {
        expect(gate.featureId).toBeTruthy();
        expect(gate.featureName).toBeTruthy();
        expect(gate.description).toBeTruthy();
        expect(gate.requiresSessions).toBeGreaterThan(0);
        expect(gate.icon).toBeTruthy();
      }
    });

    it('gates are ordered by increasing session requirement', () => {
      for (let i = 1; i < FEATURE_UNLOCK_GATES.length; i++) {
        expect(FEATURE_UNLOCK_GATES[i]!.requiresSessions).toBeGreaterThanOrEqual(
          FEATURE_UNLOCK_GATES[i - 1]!.requiresSessions,
        );
      }
    });

    it('clean_today_strip unlocks at 2 sessions', () => {
      const gate = FEATURE_UNLOCK_GATES.find(
        (g) => g.featureId === 'clean_today_strip',
      );
      expect(gate).toBeDefined();
      expect(gate!.requiresSessions).toBe(2);
    });

    it('coach_evolution unlocks at 8 sessions', () => {
      const gate = FEATURE_UNLOCK_GATES.find(
        (g) => g.featureId === 'coach_evolution',
      );
      expect(gate).toBeDefined();
      expect(gate!.requiresSessions).toBe(8);
    });
  });

  describe('STEP_CONTENT', () => {
    it('has content for every step in STEP_ORDER', () => {
      for (const step of STEP_ORDER) {
        expect(STEP_CONTENT[step]).toBeDefined();
        expect(STEP_CONTENT[step].title).toBeTruthy();
        expect(STEP_CONTENT[step].content).toBeTruthy();
        expect(STEP_CONTENT[step].primaryAction).toBeTruthy();
      }
    });

    it('WELCOME shows skip option', () => {
      expect(STEP_CONTENT.WELCOME.showSkip).toBe(true);
    });

    it('FIRST_SESSION does not show skip', () => {
      expect(STEP_CONTENT.FIRST_SESSION.showSkip).toBe(false);
    });

    it('each step content references its own step', () => {
      for (const step of STEP_ORDER) {
        expect(STEP_CONTENT[step].step).toBe(step);
      }
    });
  });
});

// ============================================================================
// constants
// ============================================================================

describe('ONBOARDING_GOALS', () => {
  it('has 4 goals', () => {
    expect(ONBOARDING_GOALS).toHaveLength(4);
  });

  it('each goal has id, label, description', () => {
    for (const goal of ONBOARDING_GOALS) {
      expect(goal.id).toBeTruthy();
      expect(goal.label).toBeTruthy();
      expect(goal.description).toBeTruthy();
    }
  });

  it('covers all FocusGoal types', () => {
    const ids = ONBOARDING_GOALS.map((g) => g.id);
    expect(ids).toContain('WORK');
    expect(ids).toContain('STUDY');
    expect(ids).toContain('CREATIVE');
    expect(ids).toContain('PERSONAL');
  });
});
