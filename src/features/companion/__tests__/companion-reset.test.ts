/**
 * Companion Service — Singleton Reset Tests
 */

import {
  getCompanionService,
  resetCompanionService,
} from '../service';
import type { CompanionState } from '../types';

function makeState(overrides: Partial<CompanionState> = {}): CompanionState {
  return {
    id: 'companion_test',
    userId: 'test-user',
    phase: 'HATCHING' as const,
    level: 1,
    totalFocusMinutes: 0,
    element: 'FLAME' as const,
    elementAffinity: 75,
    currentMood: 'SLEEPY' as const,
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

describe('resetCompanionService', () => {
  afterEach(() => {
    resetCompanionService();
  });

  it('creates a new instance after reset', () => {
    const service1 = getCompanionService(makeState({ level: 1 }));
    expect(service1.getState()?.level).toBe(1);

    resetCompanionService();

    const service2 = getCompanionService(makeState({ level: 5 }));
    expect(service2.getState()?.level).toBe(5);
  });

  it('returns null state when no initial state provided after reset', () => {
    getCompanionService(makeState());
    resetCompanionService();
    const service = getCompanionService();
    expect(service.getState()).toBeNull();
  });

  it('creates independent instances after multiple resets', () => {
    const s1 = getCompanionService(makeState({ level: 1 }));
    resetCompanionService();
    const s2 = getCompanionService(makeState({ level: 2 }));
    resetCompanionService();
    const s3 = getCompanionService(makeState({ level: 3 }));

    expect(s3.getState()?.level).toBe(3);
    // s1 and s2 are stale references but still hold old state
    expect(s1.getState()?.level).toBe(1);
    expect(s2.getState()?.level).toBe(2);
  });

  it('reset allows re-initialization with different state', () => {
    const s1 = getCompanionService(makeState({ element: 'FLAME' as const }));
    expect(s1.getState()?.element).toBe('FLAME');

    resetCompanionService();

    const s2 = getCompanionService(makeState({ element: 'WATER' as const }));
    expect(s2.getState()?.element).toBe('WATER');
  });
});
