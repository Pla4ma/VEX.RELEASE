/**
 * Companion Feature — CompanionService Session Tests
 *
 * Covers: CompanionService constructor, getState, startSession, completeSession, onEvent
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

describe('CompanionService', () => {
  let service: CompanionService;
  let state: CompanionState;

  beforeEach(() => {
    state = makeState();
    service = new CompanionService(state);
  });

  describe('constructor', () => {
    it('initializes with provided state', () => {
      expect(service.getState()).toMatchObject({ id: state.id, userId: state.userId });
    });

    it('initializes with null state when no initial state', () => {
      const emptyService = new CompanionService();
      expect(emptyService.getState()).toBeNull();
    });
  });

  describe('getState', () => {
    it('returns a copy of state', () => {
      const s1 = service.getState();
      const s2 = service.getState();
      expect(s1).not.toBe(s2);
      expect(s1).toEqual(s2);
    });

    it('returns null when no state', () => {
      expect(new CompanionService().getState()).toBeNull();
    });
  });

  describe('startSession', () => {
    it('sets mood to SLEEPY and resets progress', () => {
      service.startSession();
      const s = service.getState();
      expect(s?.currentMood).toBe('SLEEPY');
      expect(s?.sessionProgress).toBe(0);
      expect(s?.energyLevel).toBe(50);
    });

    it('does nothing when state is null', () => {
      const emptyService = new CompanionService();
      emptyService.startSession();
      expect(emptyService.getState()).toBeNull();
    });

    it('emits MOOD_SHIFT event', () => {
      const events: unknown[] = [];
      service.onEvent((e) => events.push(e));
      service.startSession();
      expect(events).toHaveLength(1);
      expect((events[0] as { type: string }).type).toBe('MOOD_SHIFT');
    });
  });

  describe('completeSession', () => {
    it('returns no level up or evolution for small session', () => {
      const result = service.completeSession(1, 80);
      expect(result.leveledUp).toBeDefined();
      expect(result.evolved).toBeDefined();
    });

    it('returns no result when state is null', () => {
      const emptyService = new CompanionService();
      const result = emptyService.completeSession(30, 90);
      expect(result.leveledUp).toBe(false);
      expect(result.evolved).toBe(false);
    });

    it('increments session count', () => {
      service.completeSession(30, 80);
      const s = service.getState();
      expect(s?.sessionCount).toBe(1);
    });

    it('tracks perfect sessions when purity > 90', () => {
      service.completeSession(30, 95);
      expect(service.getState()?.perfectSessions).toBe(1);
    });

    it('does not count as perfect when purity <= 90', () => {
      service.completeSession(30, 80);
      expect(service.getState()?.perfectSessions).toBe(0);
    });

    it('adds focus minutes', () => {
      service.completeSession(30, 80);
      expect(service.getState()?.totalFocusMinutes).toBe(30);
    });
  });

  describe('onEvent', () => {
    it('returns unsubscribe function', () => {
      const unsub = service.onEvent(() => {});
      expect(typeof unsub).toBe('function');
    });

    it('unsubscribes correctly', () => {
      const events: unknown[] = [];
      const unsub = service.onEvent((e) => events.push(e));
      service.startSession();
      expect(events.length).toBeGreaterThan(0);
      events.length = 0;
      unsub();
      service.startSession();
      expect(events).toHaveLength(0);
    });
  });
});
