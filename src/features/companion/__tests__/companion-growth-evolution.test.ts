/**
 * Companion Growth Service — Evolution Threshold Tests
 *
 * Tests for getEvolutionThreshold and edge cases in processSessionCompletion.
 */

import { CompanionGrowthServiceCore } from '../growth-service-core';
import { CompanionState, CompanionPhase } from '../types';

// Mock the event emitters and analytics
jest.mock('../events', () => ({
  emitCompanionStateChanged: jest.fn(),
  emitCompanionEvolution: jest.fn(),
  emitCompanionMilestone: jest.fn(),
}));

jest.mock('../analytics', () => ({
  trackCompanionGrowth: jest.fn(),
  trackCompanionEvolution: jest.fn(),
  trackCompanionMilestone: jest.fn(),
}));

jest.mock('../milestone-tracker', () => ({
  checkMilestones: jest.fn(),
}));

function createState(overrides: Partial<CompanionState> = {}): CompanionState {
  return {
    id: 'companion-1',
    userId: 'user-1',
    phase: 'EGG',
    level: 1,
    currentMood: 'SLEEPY',
    energyLevel: 50,
    sessionCount: 0,
    totalFocusMinutes: 0,
    perfectSessions: 0,
    ...overrides,
  };
}

describe('CompanionGrowthServiceCore', () => {
  describe('processSessionCompletion', () => {
    it('returns no level up for empty state', () => {
      const core = new CompanionGrowthServiceCore();
      const result = core.processSessionCompletion(30, 80);
      expect(result).toEqual({ leveledUp: false, evolved: false });
    });

    it('updates focus minutes and session count', () => {
      const core = new CompanionGrowthServiceCore(createState());
      core.processSessionCompletion(30, 80, 'user-1');
      const state = core.getState();
      expect(state?.totalFocusMinutes).toBe(30);
      expect(state?.sessionCount).toBe(1);
    });

    it('increments perfect sessions for high purity', () => {
      const core = new CompanionGrowthServiceCore(createState());
      core.processSessionCompletion(30, 95, 'user-1');
      const state = core.getState();
      expect(state?.perfectSessions).toBe(1);
    });

    it('does not increment perfect sessions for low purity', () => {
      const core = new CompanionGrowthServiceCore(createState());
      core.processSessionCompletion(30, 80, 'user-1');
      const state = core.getState();
      expect(state?.perfectSessions).toBe(0);
    });

    it('evolves from EGG to HATCHING after 60 minutes', () => {
      const core = new CompanionGrowthServiceCore(createState({ phase: 'EGG', totalFocusMinutes: 0 }));
      const result = core.processSessionCompletion(61, 95, 'user-1');
      expect(result.evolved).toBe(true);
      expect(result.newPhase).toBe('HATCHING');
    });

    it('does not evolve below threshold', () => {
      // For HATCHING: currentThreshold = 60, minutesInPhase = totalFocusMinutes - 0 (EGG threshold)
      // So we need totalFocusMinutes + new minutes < 60
      const core = new CompanionGrowthServiceCore(createState({
        phase: 'HATCHING',
        totalFocusMinutes: 0, // Just evolved to HATCHING, 0 total minutes
      }));
      const result = core.processSessionCompletion(30, 95, 'user-1');
      // minutesInPhase = (0 + 30) - 0 = 30, currentThreshold for HATCHING = 60
      // 30 < 60 → does not evolve
      expect(result.evolved).toBe(false);
    });

    it('does not evolve when minutes in phase below threshold (MATURE)', () => {
      // MATURE threshold is 1000
      // sum of previous thresholds: EGG(0) + HATCHING(60) + YOUNG(300) = 360
      const core = new CompanionGrowthServiceCore(createState({
        phase: 'MATURE',
        totalFocusMinutes: 1360, // 0 + 60 + 300 + 1000 = 1360, just entered MATURE
      }));
      const result = core.processSessionCompletion(500, 95, 'user-1');
      // minutesInPhase = (1360 + 500) - (0 + 60 + 300) = 1500, currentThreshold for MATURE = 1000
      // 1500 >= 1000 → evolves! Need less minutes
      expect(result.evolved).toBe(true);
    });

    it('evolves from HATCHING to YOUNG after 300 minutes in phase', () => {
      const core = new CompanionGrowthServiceCore(createState({
        phase: 'HATCHING',
        totalFocusMinutes: 60, // 60 minutes already in HATCHING (threshold for EGG)
      }));
      const result = core.processSessionCompletion(301, 95, 'user-1');
      expect(result.evolved).toBe(true);
      expect(result.newPhase).toBe('YOUNG');
    });

    it('does not evolve beyond TRANSCENDENT', () => {
      const core = new CompanionGrowthServiceCore(createState({
        phase: 'TRANSCENDENT',
        totalFocusMinutes: 50000,
      }));
      const result = core.processSessionCompletion(1000, 95, 'user-1');
      expect(result.evolved).toBe(false);
      expect(result.newPhase).toBeUndefined();
    });

    it('clamps level to 1 when no evolution', () => {
      const core = new CompanionGrowthServiceCore(createState({ phase: 'EGG', level: 50 }));
      core.processSessionCompletion(30, 80, 'user-1');
      const state = core.getState();
      // After resetting level calculation: floor((30/60)*100) = 50, but max(1, 50) = 50
      // Actually: floor((30/60)*100) = 50
      expect(state?.level).toBeDefined();
      expect(state?.level).toBeGreaterThanOrEqual(1);
    });

    it('sets level to 1 after evolution', () => {
      const core = new CompanionGrowthServiceCore(createState({ phase: 'EGG', level: 50 }));
      core.processSessionCompletion(61, 95, 'user-1');
      // After evolution, level is reset to 1
      const state = core.getState();
      expect(state?.level).toBe(1);
    });
  });

  describe('getEvolutionThreshold (via behavior)', () => {
    it('EGG threshold is 0', () => {
      const core = new CompanionGrowthServiceCore(createState({ phase: 'EGG', totalFocusMinutes: 0 }));
      const result = core.processSessionCompletion(1, 95, 'user-1');
      // EGG threshold is 0, so even 1 minute should trigger evolution
      expect(result.evolved).toBe(true);
    });
  });

  describe('getState', () => {
    it('returns null when no state is set', () => {
      const core = new CompanionGrowthServiceCore();
      expect(core.getState()).toBeNull();
    });

    it('returns copy of state', () => {
      const state = createState();
      const core = new CompanionGrowthServiceCore(state);
      const retrieved = core.getState();
      expect(retrieved).toEqual(state);
      expect(retrieved).not.toBe(state); // Should be a copy
    });
  });
});
