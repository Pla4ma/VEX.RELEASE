import { getCompanionService, resetCompanionService } from '../service';
import type { CompanionState } from '../types';

function makeState(overrides: Partial<CompanionState> = {}): CompanionState {
  return {
    id: 'companion_test', userId: 'test-user', phase: 'HATCHING', level: 1,
    totalFocusMinutes: 0, element: 'FLAME', elementAffinity: 75,
    currentMood: 'SLEEPY', sessionProgress: 0, purityScore: 85, energyLevel: 50,
    visualSeed: 42, colorHue: 15, particleDensity: 0.8, sessionCount: 0,
    perfectSessions: 0, longestFocusStreak: 0, nextEvolutionAt: 60,
    updatedAt: Date.now(), ...overrides,
  };
}

describe('resetCompanionService', () => {
  afterEach(() => resetCompanionService());

  it('creates new instance after reset', () => {
    const s1 = getCompanionService(makeState({ level: 1 }));
    expect(s1.getState()?.level).toBe(1);
    resetCompanionService();
    const s2 = getCompanionService(makeState({ level: 5 }));
    expect(s2.getState()?.level).toBe(5);
  });

  it('returns null state after reset without init', () => {
    getCompanionService(makeState());
    resetCompanionService();
    expect(getCompanionService().getState()).toBeNull();
  });
});
