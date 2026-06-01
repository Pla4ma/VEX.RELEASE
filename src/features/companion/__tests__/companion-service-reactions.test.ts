/**
 * Companion Feature — CompanionService Reaction Tests
 *
 * Covers: reactToStreakMaintained, reactToComebackCompleted,
 *         reactToFocusScoreChanged, reactToDailyMissionCompleted
 */

jest.mock('../../../events/EventBus', () => ({
  eventBus: {
    publish: jest.fn(),
    subscribe: jest.fn(() => jest.fn()),
  },
}));

jest.mock('../../../shared/analytics/analytics-service', () => ({
  capture: jest.fn(),
}));

import { CompanionService } from '../service';
import type { CompanionState } from '../types';

function makeState(overrides?: Partial<CompanionState>): CompanionState {
  return {
    id: 'companion_test-user',
    userId: 'test-user',
    phase: 'EGG',
    level: 1,
    totalFocusMinutes: 0,
    element: 'FLAME',
    elementAffinity: 75,
    currentMood: 'SLEEPY',
    sessionProgress: 0,
    purityScore: 85,
    energyLevel: 50,
    visualSeed: 42,
    colorHue: 15,
    particleDensity: 0.8,
    sessionCount: 0,
    perfectSessions: 0,
    longestFocusStreak: 0,
    nextEvolutionAt: 0,
    updatedAt: Date.now(),
    ...overrides,
  };
}

describe('CompanionService reactions', () => {
  let service: CompanionService;
  let state: CompanionState;

  beforeEach(() => {
    state = makeState();
    service = new CompanionService(state);
  });

  describe('reactToStreakMaintained', () => {
    it('does nothing when state is null', () => {
      const emptyService = new CompanionService();
      emptyService.reactToStreakMaintained('user');
      expect(emptyService.getState()).toBeNull();
    });

    it('emits milestone event', () => {
      const events: unknown[] = [];
      service.onEvent((e) => events.push(e));
      service.reactToStreakMaintained('user');
      expect(events.some((e) => (e as { type: string }).type === 'MILESTONE')).toBe(true);
    });
  });

  describe('reactToComebackCompleted', () => {
    it('does nothing when state is null', () => {
      const emptyService = new CompanionService();
      emptyService.reactToComebackCompleted('user');
      expect(emptyService.getState()).toBeNull();
    });

    it('emits milestone event', () => {
      const events: unknown[] = [];
      service.onEvent((e) => events.push(e));
      service.reactToComebackCompleted('user');
      expect(events.some((e) => (e as { type: string }).type === 'MILESTONE')).toBe(true);
    });
  });

  describe('reactToFocusScoreChanged', () => {
    it('emits GROWTH_PULSE when score increases', () => {
      const events: unknown[] = [];
      service.onEvent((e) => events.push(e));
      service.reactToFocusScoreChanged('user', 500, 600);
      expect(events.some((e) => (e as { type: string }).type === 'GROWTH_PULSE')).toBe(true);
    });

    it('emits MOOD_SHIFT when score decreases', () => {
      const events: unknown[] = [];
      service.onEvent((e) => events.push(e));
      service.reactToFocusScoreChanged('user', 600, 500);
      expect(events.some((e) => (e as { type: string }).type === 'MOOD_SHIFT')).toBe(true);
    });
  });

  describe('reactToDailyMissionCompleted', () => {
    it('emits milestone event', () => {
      const events: unknown[] = [];
      service.onEvent((e) => events.push(e));
      service.reactToDailyMissionCompleted('user');
      expect(events.some((e) => (e as { type: string }).type === 'MILESTONE')).toBe(true);
    });
  });
});
