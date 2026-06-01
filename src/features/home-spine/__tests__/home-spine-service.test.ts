/**
 * Tests for home-spine service.ts
 * (buildHomeReturnReasonState, buildHomeSpineModel)
 */

import { buildHomeReturnReasonState, buildHomeSpineModel } from '../service';
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

const nextBestAction = {
  title: 'Start the next focus block',
  description: 'One clean session today.',
  ctaLabel: 'Start focus session',
};

// ---------------------------------------------------------------------------
// service.ts tests
// ---------------------------------------------------------------------------
describe('home-spine: service', () => {
  describe('buildHomeReturnReasonState', () => {
    it('prioritises primary recommendation when available', () => {
      const result = buildHomeReturnReasonState({
        activeStudyPlan: null,
        canShowExpansionSystems: true,
        comebackMessage: null,
        nextBestAction,
        primaryRecommendation: {
          id: 'rec-1',
          reasoning: 'Best time to focus.',
          suggestedDifficulty: 'NORMAL',
          suggestedDuration: 1500,
          type: 'OPTIMAL_TIME',
        },
      });
      expect(result.source).toBe('coach');
      expect(result.intent).toBe('accept-coach-recommendation');
      expect(result.title).toBeTruthy();
    });

    it('falls back to comeback message when no recommendation', () => {
      const result = buildHomeReturnReasonState({
        activeStudyPlan: null,
        canShowExpansionSystems: true,
        comebackMessage: 'Welcome back!',
        nextBestAction,
        primaryRecommendation: null,
      });
      expect(result.source).toBe('comeback');
      expect(result.tone).toBe('warning');
    });

    it('falls back to study plan when no recommendation or comeback', () => {
      const result = buildHomeReturnReasonState({
        activeStudyPlan: {
          completedTasks: 2,
          remainingMinutes: 30,
          title: 'Week 1 Plan',
          totalTasks: 5,
        },
        canShowExpansionSystems: true,
        comebackMessage: null,
        nextBestAction,
        primaryRecommendation: null,
      });
      expect(result.source).toBe('study-plan');
      expect(result.intent).toBe('continue-study-plan');
    });

    it('skips study plan when canShowExpansionSystems is false', () => {
      const result = buildHomeReturnReasonState({
        activeStudyPlan: {
          completedTasks: 2,
          remainingMinutes: 30,
          title: 'Plan',
          totalTasks: 5,
        },
        canShowExpansionSystems: false,
        comebackMessage: null,
        nextBestAction,
        primaryRecommendation: null,
      });
      expect(result.source).toBe('next-best-action');
    });

    it('falls back to nextBestAction when nothing else matches', () => {
      const result = buildHomeReturnReasonState({
        activeStudyPlan: null,
        canShowExpansionSystems: true,
        comebackMessage: null,
        nextBestAction,
        primaryRecommendation: null,
      });
      expect(result.source).toBe('next-best-action');
      expect(result.title).toBe(nextBestAction.title);
    });
  });

  describe('buildHomeSpineModel', () => {
    it('returns a valid HomeSpineModel with all required fields', () => {
      const model = buildHomeSpineModel({
        currentStreak: 5,
        homeHighlight: null,
        isAtRisk: false,
        isFirstRun: false,
        level: 3,
        progressPercent: 45,
        progressXp: 1200,
        returnReason: makeReturnReason(),
        todayFocusMinutes: 30,
      });
      expect(model.primaryAction).toBeDefined();
      expect(model.progressSignal).toBeDefined();
      expect(model.returnReason).toBeDefined();
    });

    it('incorporates homeHighlight into returnReason', () => {
      const model = buildHomeSpineModel({
        currentStreak: 5,
        homeHighlight: {
          title: 'Session complete!',
          message: 'Great work today.',
          tone: 'celebration',
        },
        isAtRisk: false,
        isFirstRun: false,
        level: 3,
        progressPercent: 50,
        progressXp: 1000,
        returnReason: makeReturnReason(),
        todayFocusMinutes: 25,
      });
      expect(model.returnReason.source).toBe('completion-highlight');
      expect(model.returnReason.title).toBe('Session complete!');
    });
  });
});
