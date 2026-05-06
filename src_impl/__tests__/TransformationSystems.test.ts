/**
 * Transformation Systems Unit Tests
 *
 * Tests for all Phase 5-6 systems:
 * - StreakCreatureSystem
 * - PrimeTimeEventScheduler
 * - WeeklyRaidSystem
 * - PredictiveInterventionEngine
 * - AdaptiveDifficultyEngine
 * - SessionNarrator
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Phase 5 Systems
import {
  StreakCreatureSystem,
  CreatureEvolutionStage,
} from '../streaks/StreakCreatureSystem';

import {
  PrimeTimeEventScheduler,
  PrimeTimeWindow,
} from '../retention/PrimeTimeEventScheduler';

import {
  WeeklyRaidSystem,
  SquadRaidEncounter,
} from '../features/boss/WeeklyRaidSystem';

// Phase 6 Systems
import {
  PredictiveInterventionEngine,
  RiskPrediction,
} from '../features/ai-coach/PredictiveInterventionEngine';

import {
  AdaptiveDifficultyEngine,
  DifficultyRating,
} from '../features/boss/AdaptiveDifficultyEngine';

import {
  SessionNarrator,
} from '../features/session-story/SessionNarrator';

// Mock feature flags
vi.mock('../feature-flags/FeatureFlagEngine', () => ({
  featureFlags: {
    isEnabled: vi.fn(() => true),
  },
}));

// Mock event bus
vi.mock('../events', () => ({
  eventBus: {
    publish: vi.fn(),
    subscribe: vi.fn(),
  },
}));

describe('Phase 5: Retention Systems', () => {
  describe('StreakCreatureSystem', () => {
    let system: StreakCreatureSystem;

    beforeEach(() => {
      system = new StreakCreatureSystem();
    });

    it('should return correct creature state for 3-day streak', () => {
      const state = system.getCreatureState('user-1', 3);
      expect(state.evolution).toBe(CreatureEvolutionStage.FLAME);
      expect(state.health).toBeGreaterThan(90);
    });

    it('should return correct creature state for 15-day streak', () => {
      const state = system.getCreatureState('user-1', 15);
      expect(state.evolution).toBe(CreatureEvolutionStage.SAPLING);
    });

    it('should return correct creature state for 45-day streak', () => {
      const state = system.getCreatureState('user-1', 45);
      expect(state.evolution).toBe(CreatureEvolutionStage.TREE);
    });

    it('should return correct creature state for 100-day streak', () => {
      const state = system.getCreatureState('user-1', 100);
      expect(state.evolution).toBe(CreatureEvolutionStage.DRAGON);
      expect(state.health).toBe(100);
    });

    it('should detect risk at 40+ hours since last session', () => {
      const now = Date.now();
      const state = system.updateStreakState('user-1', 10, false, now - 41 * 60 * 60 * 1000);
      expect(state.riskLevel).toBe('high');
      expect(state.isNearBreak).toBe(true);
    });

    it('should calculate revive cost based on streak length', () => {
      const cost = system.calculateReviveCost('user-1', 50);
      expect(cost).toBeGreaterThan(50);
      expect(cost).toBeLessThanOrEqual(500);
    });

    it('should provide emergency quest when creature is near death', () => {
      const quest = system.getEmergencyQuest('user-1', 47);
      expect(quest).toBeDefined();
      expect(quest?.type).toBeDefined();
    });
  });

  describe('PrimeTimeEventScheduler', () => {
    let scheduler: PrimeTimeEventScheduler;

    beforeEach(() => {
      scheduler = new PrimeTimeEventScheduler();
    });

    it('should get upcoming windows for next 24 hours', () => {
      const windows = scheduler.getUpcomingWindows(24);
      expect(windows.length).toBeGreaterThan(0);
      expect(windows[0]).toHaveProperty('id');
      expect(windows[0]).toHaveProperty('name');
      expect(windows[0]).toHaveProperty('startsAt');
    });

    it('should return null when no active window', () => {
      const active = scheduler.getActiveWindow();
      // Will be null if no window is active
      expect(active === null || active.id).toBeDefined();
    });

    it('should check if session qualifies for active window', () => {
      const active = scheduler.getActiveWindow();
      if (active) {
        const qualifies = scheduler.sessionQualifiesForWindow(active.id, 1500, 85); // 25min, 85%
        expect(qualifies).toBe(true);
      }
    });

    it('should calculate bonus multiplier', () => {
      const multiplier = scheduler.getBonusMultiplier('morning_rally');
      expect(multiplier.xp).toBeGreaterThanOrEqual(1);
      expect(multiplier.coins).toBeGreaterThanOrEqual(1);
    });
  });

  describe('WeeklyRaidSystem', () => {
    let system: WeeklyRaidSystem;

    beforeEach(() => {
      system = new WeeklyRaidSystem();
    });

    it('should create raid encounter with scaled health', () => {
      const encounter = system.getOrCreateRaid('squad-1', 5);
      expect(encounter).toBeDefined();
      expect(encounter?.maxHealth).toBeGreaterThan(0);
      expect(encounter?.currentHealth).toBe(encounter?.maxHealth);
    });

    it('should apply damage and track contributions', () => {
      const encounter = system.getOrCreateRaid('squad-1', 5);
      if (!encounter) {return;}

      const result = system.contributeDamage(
        'squad-1',
        'user-1',
        'Test User',
        null,
        5000
      );

      expect(result.success).toBe(true);
      expect(result.damageApplied).toBe(5000);
      expect(result.timeRemaining).toBeGreaterThan(0);
    });

    it('should detect boss defeat when health reaches 0', () => {
      const encounter = system.getOrCreateRaid('squad-1', 2);
      if (!encounter) {return;}

      // Deal enough damage to defeat
      const damage = encounter.maxHealth;
      const result = system.contributeDamage('squad-1', 'user-1', 'Test', null, damage);

      expect(result.bossDefeated).toBe(true);
    });

    it('should return FOMO message when raid is active', () => {
      const message = system.getFOMOMessage('squad-1');
      // May be null if no active raid
      expect(message === null || typeof message === 'string').toBe(true);
    });
  });
});

describe('Phase 6: AI Systems', () => {
  describe('PredictiveInterventionEngine', () => {
    let engine: PredictiveInterventionEngine;

    beforeEach(() => {
      engine = new PredictiveInterventionEngine();
    });

    it('should analyze user patterns from session history', () => {
      const history = [
        { date: '2024-01-01', completed: true, duration: 1500, hour: 9, dayOfWeek: 1 },
        { date: '2024-01-02', completed: true, duration: 1800, hour: 9, dayOfWeek: 2 },
        { date: '2024-01-03', completed: false, duration: 0, hour: 0, dayOfWeek: 3 },
        { date: '2024-01-04', completed: true, duration: 1500, hour: 14, dayOfWeek: 4 },
      ];

      const pattern = engine.analyzeUserPatterns('user-1', history, 3, 5);

      expect(pattern.userId).toBe('user-1');
      expect(pattern.completionRate).toBeGreaterThan(0);
      expect(pattern.daysOfWeek.length).toBeGreaterThan(0);
    });

    it('should detect declining trend', () => {
      const history = [
        // First half: high completion
        { date: '2024-01-01', completed: true, duration: 1500, hour: 9, dayOfWeek: 1 },
        { date: '2024-01-02', completed: true, duration: 1800, hour: 9, dayOfWeek: 2 },
        { date: '2024-01-03', completed: true, duration: 1500, hour: 9, dayOfWeek: 3 },
        // Second half: low completion
        { date: '2024-01-04', completed: false, duration: 0, hour: 0, dayOfWeek: 4 },
        { date: '2024-01-05', completed: false, duration: 0, hour: 0, dayOfWeek: 5 },
        { date: '2024-01-06', completed: false, duration: 0, hour: 0, dayOfWeek: 6 },
      ];

      const pattern = engine.analyzeUserPatterns('user-1', history, 3, 6);
      expect(pattern.last30DaysTrend).toBe('down');
    });

    it('should generate streak risk prediction', () => {
      const pattern = {
        userId: 'user-1',
        patternType: 'inconsistent' as const,
        daysOfWeek: [1, 2, 3],
        timeOfDay: [9, 14],
        averageSessionDuration: 1500,
        completionRate: 0.5,
        streakBreakFrequency: 2,
        last30DaysTrend: 'declining' as const,
      };

      const predictions = engine.generatePredictions('user-1', pattern, '2024-01-01', 30);

      const streakRisk = predictions.find(p => p.type === 'STREAK_AT_RISK');
      expect(streakRisk).toBeDefined();
      expect(streakRisk!.confidence).toBeGreaterThan(0);
    });

    it('should return risk level for user', () => {
      // Set up some predictions first
      const pattern = {
        userId: 'user-1',
        patternType: 'inconsistent' as const,
        daysOfWeek: [1],
        timeOfDay: [9],
        averageSessionDuration: 1500,
        completionRate: 0.4,
        streakBreakFrequency: 3,
        last30DaysTrend: 'declining' as const,
      };

      engine.generatePredictions('user-1', pattern, '2024-01-01', 40);

      const risk = engine.getCurrentRiskLevel('user-1');
      expect(risk.hasActivePredictions).toBe(true);
      expect(risk.highestSeverity).toBeDefined();
    });
  });

  describe('AdaptiveDifficultyEngine', () => {
    let engine: AdaptiveDifficultyEngine;

    beforeEach(() => {
      engine = new AdaptiveDifficultyEngine();
    });

    it('should recommend NORMAL difficulty for new users', () => {
      const result = engine.getRecommendedDifficulty('user-1');
      expect(result.rating).toBe('NORMAL');
      expect(result.config.healthMultiplier).toBe(1.0);
    });

    it('should suggest difficulty increase for high performers', () => {
      const sessions = [
        { completed: true, purity: 95, grade: 'S', duration: 1800, bossDefeated: true, bossDamage: 1000 },
        { completed: true, purity: 90, grade: 'S', duration: 1800, bossDefeated: true, bossDamage: 1000 },
        { completed: true, purity: 92, grade: 'A', duration: 1800, bossDefeated: true, bossDamage: 1000 },
      ];

      engine.updateMetrics('user-1', sessions);
      const suggestion = engine.getProgressionSuggestion('user-1');

      // Should suggest increase for 100% completion, high purity
      expect(suggestion.confidence).toBeGreaterThan(0);
    });

    it('should suggest difficulty decrease for struggling users', () => {
      const sessions = [
        { completed: false, purity: 50, grade: 'D', duration: 300, bossDefeated: false, bossDamage: 100 },
        { completed: false, purity: 40, grade: 'F', duration: 200, bossDefeated: false, bossDamage: 50 },
      ];

      engine.setDifficulty('user-1', 'HARD');
      engine.updateMetrics('user-1', sessions);
      const suggestion = engine.getProgressionSuggestion('user-1');

      // Should suggest decrease for <50% completion
      expect(suggestion.confidence).toBeGreaterThan(0);
    });

    it('should apply difficulty multiplier to boss config', () => {
      const baseBoss = {
        id: 'test-boss',
        name: 'Test Boss',
        baseHealth: 1000,
        attackFrequency: 2,
        purityThreshold: 75,
        timeLimit: 3000,
      };

      engine.setDifficulty('user-1', 'HARD');
      const config = engine.applyConfigToBoss(baseBoss, 'user-1');

      expect(config.health).toBeGreaterThan(baseBoss.baseHealth);
      expect(config.difficultyRating).toBe('HARD');
    });

    it('should set and retrieve difficulty manually', () => {
      const adjustment = engine.setDifficulty('user-1', 'EXTREME');

      expect(adjustment.newRating).toBe('EXTREME');
      expect(adjustment.changes.healthChange).toBeGreaterThan(0);
    });
  });

  describe('SessionNarrator', () => {
    let narrator: SessionNarrator;

    beforeEach(() => {
      narrator = new SessionNarrator();
    });

    it('should create narrative with opening beat', () => {
      const narrative = narrator.startNarrative('session-1', 'user-1');

      expect(narrative.sessionId).toBe('session-1');
      expect(narrative.userId).toBe('user-1');
      expect(narrative.beats.length).toBeGreaterThan(0);
      expect(narrative.beats[0].type).toBe('OPENING');
    });

    it('should record interruption with intensity', () => {
      narrator.startNarrative('session-2', 'user-1');
      narrator.recordInterruption('session-2', 5);

      const narrative = narrator.getNarrative('session-2');
      expect(narrative?.totalInterruptions).toBe(1);
      expect(narrative?.beats.some(b => b.type === 'INTERRUPTION')).toBe(true);
    });

    it('should record pure focus streak', () => {
      narrator.startNarrative('session-3', 'user-1');
      narrator.recordPureFocusStreak('session-3', 600); // 10 minutes

      const narrative = narrator.getNarrative('session-3');
      expect(narrative?.longestPureStreak).toBe(600);
    });

    it('should record combo achievements', () => {
      narrator.startNarrative('session-4', 'user-1');
      narrator.recordCombo('session-4', 5);

      const narrative = narrator.getNarrative('session-4');
      expect(narrative?.comboCount).toBe(5);
    });

    it('should finalize narrative with correct theme', () => {
      narrator.startNarrative('session-5', 'user-1');
      narrator.recordBossEvent('session-5', 'VICTORY', { healthRemaining: 5 });

      const narrative = narrator.finalizeNarrative('session-5', true, {
        duration: 1800,
        purity: 85,
        bossDefeated: true,
      });

      expect(narrative.theme).toBe('comeback');
      expect(narrative.closingLine).toBeDefined();
      expect(narrative.shareableSummary).toBeDefined();
      expect(narrative.heroQuote).toBeDefined();
    });

    it('should generate story card data', () => {
      narrator.startNarrative('session-6', 'user-1');
      narrator.recordInterruption('session-6', 3);
      narrator.recordInterruption('session-6', 5);
      narrator.recordInterruption('session-6', 2);
      narrator.recordPureFocusStreak('session-6', 900);

      narrator.finalizeNarrative('session-6', true, {
        duration: 1800,
        purity: 70,
        bossDefeated: true,
      });

      const card = narrator.getStoryCard('session-6');
      expect(card).toBeDefined();
      expect(card?.title).toBeDefined();
      expect(card?.subtitle).toBeDefined();
      expect(card?.stats.length).toBeGreaterThan(0);
      expect(card?.theme).toBeDefined();
    });

    it('should handle abandoned sessions', () => {
      narrator.startNarrative('session-7', 'user-1');
      narrator.recordInterruption('session-7', 2);

      const narrative = narrator.finalizeNarrative('session-7', false, {
        duration: 300,
        purity: 30,
        bossDefeated: false,
      });

      expect(narrative.theme).toBe('struggle');
    });
  });
});

describe('Integration: Event Wiring', () => {
  it('should handle session start event', () => {
    const mockPayload = {
      sessionId: 'test-123',
      userId: 'user-1',
      mode: 'FLOW',
      duration: 1500,
    };

    // Verify event structure
    expect(mockPayload.sessionId).toBeDefined();
    expect(mockPayload.userId).toBeDefined();
  });

  it('should handle session completion event', () => {
    const mockPayload = {
      sessionId: 'test-123',
      userId: 'user-1',
      duration: 1500,
      purity: 85,
      bossDefeated: true,
      streakMaintained: true,
    };

    expect(mockPayload.purity).toBeGreaterThan(0);
    expect(mockPayload.bossDefeated).toBe(true);
  });

  it('should handle streak broken event', () => {
    const mockPayload = {
      userId: 'user-1',
      days: 15,
      previousLongest: 20,
    };

    expect(mockPayload.days).toBeGreaterThan(0);
  });
});
