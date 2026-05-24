import { CompanionService } from '../service';
import type { CompanionState } from '../types';

function createTestState(overrides: Partial<CompanionState> = {}): CompanionState {
  return {
    id: 'companion_test',
    userId: 'test-user',
    phase: 'HATCHING',
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
    nextEvolutionAt: 60,
    updatedAt: Date.now(),
    ...overrides,
  };
}

describe('CompanionService', () => {
  describe('startSession', () => {
    it('resets mood to SLEEPY and session progress to 0', () => {
      const service = new CompanionService(createTestState({ currentMood: 'ECSTATIC', sessionProgress: 50 }));
      service.startSession();
      const state = service.getState();
      expect(state?.currentMood).toBe('SLEEPY');
      expect(state?.sessionProgress).toBe(0);
      expect(state?.energyLevel).toBe(50);
    });

    it('emits MOOD_SHIFT event on start', () => {
      const service = new CompanionService(createTestState());
      const events: Parameters<Parameters<typeof service.onEvent>[0]>[] = [];
      service.onEvent((event) => { events.push([event]); });
      service.startSession();
      expect(events.length).toBeGreaterThanOrEqual(1);
      expect(events[0][0].type).toBe('MOOD_SHIFT');
    });
  });

  describe('tick', () => {
    it('increases energy when purity is high', () => {
      const service = new CompanionService(createTestState({ energyLevel: 50 }));
      service.startSession();
      service.tick(60, 600, 90, false);
      expect(service.getState()?.energyLevel).toBeGreaterThan(50);
    });

    it('decreases energy when purity is low', () => {
      const service = new CompanionService(createTestState({ energyLevel: 50 }));
      service.startSession();
      service.tick(60, 600, 30, false);
      expect(service.getState()?.energyLevel).toBeLessThan(50);
    });

    it('does not change energy when paused', () => {
      const service = new CompanionService(createTestState({ energyLevel: 50 }));
      service.startSession();
      service.tick(60, 600, 90, true);
      expect(service.getState()?.energyLevel).toBe(50);
    });

    it('transitions mood to DANGER after many low-purity ticks', () => {
      const service = new CompanionService(createTestState());
      service.startSession();
      for (let i = 0; i < 200; i++) {
        service.tick(i + 1, 600, 20, false);
      }
      expect(service.getState()?.currentMood).toBe('DANGER');
    });

    it('transitions mood to ECSTATIC after many high-purity ticks at high progress', () => {
      const service = new CompanionService(createTestState());
      service.startSession();
      for (let i = 0; i < 600; i++) {
        service.tick(i + 1, 600, 95, false);
      }
      expect(service.getState()?.currentMood).toBe('ECSTATIC');
    });
  });

  describe('completeSession', () => {
    it('does not evolve phase for sessions below threshold', () => {
      const service = new CompanionService(createTestState({ phase: 'HATCHING', totalFocusMinutes: 0 }));
      service.startSession();
      const result = service.completeSession(10, 80);
      expect(result.evolved).toBe(false);
      expect(result.newPhase).toBeUndefined();
    });

    it('evolves phase when minutes exceed threshold', () => {
      const service = new CompanionService(createTestState({ phase: 'HATCHING', totalFocusMinutes: 55 }));
      service.startSession();
      const result = service.completeSession(10, 80);
      expect(result.evolved).toBe(true);
      expect(result.newPhase).toBe('YOUNG');
    });

    it('increases totalFocusMinutes after completion', () => {
      const service = new CompanionService(createTestState({ totalFocusMinutes: 0 }));
      service.startSession();
      service.completeSession(25, 85);
      expect(service.getState()?.totalFocusMinutes).toBe(25);
    });
  });

  describe('reactToStreakMaintained', () => {
    it('emits a celebratory milestone event', () => {
      const service = new CompanionService(createTestState());
      const events: Parameters<Parameters<typeof service.onEvent>[0]>[] = [];
      service.onEvent((event) => { events.push([event]); });
      service.reactToStreakMaintained('test-user');
      expect(events.length).toBeGreaterThanOrEqual(1);
      expect(events[0][0].type).toBe('MILESTONE');
    });
  });

  describe('reactToComebackCompleted', () => {
    it('emits a high-intensity milestone event', () => {
      const service = new CompanionService(createTestState());
      const events: Parameters<Parameters<typeof service.onEvent>[0]>[] = [];
      service.onEvent((event) => { events.push([event]); });
      service.reactToComebackCompleted('test-user');
      expect(events.length).toBeGreaterThanOrEqual(1);
      const milestone = events[0][0];
      expect(milestone.type).toBe('MILESTONE');
      expect(milestone.data.intensity).toBeGreaterThan(0.8);
    });
  });

  describe('reactToFocusScoreChanged', () => {
    it('emits GROWTH_PULSE when score increases', () => {
      const service = new CompanionService(createTestState());
      const events: Parameters<Parameters<typeof service.onEvent>[0]>[] = [];
      service.onEvent((event) => { events.push([event]); });
      service.reactToFocusScoreChanged('test-user', 550, 560);
      expect(events[0][0].type).toBe('GROWTH_PULSE');
    });

    it('emits MOOD_SHIFT when score decreases', () => {
      const service = new CompanionService(createTestState());
      const events: Parameters<Parameters<typeof service.onEvent>[0]>[] = [];
      service.onEvent((event) => { events.push([event]); });
      service.reactToFocusScoreChanged('test-user', 560, 550);
      expect(events[0][0].type).toBe('MOOD_SHIFT');
    });
  });
});
