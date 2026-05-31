/**
 * Companion Feature — CompanionService Tick Tests
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

describe('CompanionService tick', () => {
  let service: CompanionService;

  beforeEach(() => {
    service = new CompanionService(makeState());
  });

  it('updates session progress', () => {
    service.startSession();
    service.tick(50, 100, 90, false);
    expect(service.getState()?.sessionProgress).toBe(50);
  });

  it('increases energy when purity > 80', () => {
    service.startSession();
    const before = service.getState()?.energyLevel ?? 50;
    service.tick(1, 100, 90, false);
    expect(service.getState()?.energyLevel).toBeGreaterThan(before);
  });

  it('decreases energy when purity <= 50', () => {
    service.startSession();
    const before = service.getState()?.energyLevel ?? 50;
    service.tick(1, 100, 30, false);
    expect(service.getState()?.energyLevel).toBeLessThan(before);
  });

  it('does not change energy when paused', () => {
    service.startSession();
    service.tick(1, 100, 90, false);
    const afterActive = service.getState()?.energyLevel;
    service.tick(2, 100, 90, true);
    expect(service.getState()?.energyLevel).toBe(afterActive);
  });

  it('does nothing when state is null', () => {
    const emptyService = new CompanionService();
    emptyService.tick(10, 100, 80, false);
    expect(emptyService.getState()).toBeNull();
  });

  it('emits MILESTONE events at 10% intervals', () => {
    const events: unknown[] = [];
    service.onEvent((e) => events.push(e));
    service.startSession();
    events.length = 0; // clear startSession event
    service.tick(11, 100, 90, false); // 11% -> triggers 10% milestone
    const milestone = events.find((e) => (e as { type: string }).type === 'MILESTONE');
    expect(milestone).toBeDefined();
  });

  it('clamps energy between 0 and 100', () => {
    service.startSession();
    // Tick many times with low purity to drain energy
    for (let i = 0; i < 500; i++) {
      service.tick(i, 1000, 30, false);
    }
    expect(service.getState()?.energyLevel).toBeGreaterThanOrEqual(0);

    // Reset and tick with high purity to fill energy
    service.startSession();
    for (let i = 0; i < 500; i++) {
      service.tick(i, 1000, 95, false);
    }
    expect(service.getState()?.energyLevel).toBeLessThanOrEqual(100);
  });
});
