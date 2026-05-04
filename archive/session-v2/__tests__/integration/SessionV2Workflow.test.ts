/**
 * Session V2 Workflow Integration Tests
 * 
 * Integration tests for the complete session-v2 workflow.
 * Tests combat system integration, state management, and event flow.
 */

import { SessionV2Orchestrator } from '../../SessionV2Orchestrator';
import { CombatStateMachine } from '../../CombatStateMachine';
import { AbilitySystem } from '../../AbilitySystem';
import { DodgeMechanic } from '../../DodgeMechanic';
import { PhaseManager } from '../../PhaseManager';
import { CombatProgressionService } from '../../services/CombatProgressionService';
import { CombatEconomyService } from '../../services/CombatEconomyService';
import { CombatAnalyticsService } from '../../services/CombatAnalyticsService';
import { SessionV2Repository } from '../../repositories/SessionV2Repository';
import type { SessionV2State, CombatAbility, BossEncounter } from '../../types';

// Mock all external dependencies
jest.mock('../../../events', () => ({
  eventBus: {
    publish: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
  },
}));

jest.mock('../../../utils/debug', () => ({
  createDebugger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

describe('SessionV2 Workflow Integration', () => {
  let orchestrator: SessionV2Orchestrator;
  let combatStateMachine: CombatStateMachine;
  let abilitySystem: AbilitySystem;
  let dodgeMechanic: DodgeMechanic;
  let phaseManager: PhaseManager;
  let progressionService: CombatProgressionService;
  let economyService: CombatEconomyService;
  let analyticsService: CombatAnalyticsService;
  let repository: SessionV2Repository;

  // Test data
  let testSession: SessionV2State;
  let testBoss: BossEncounter;
  let testAbilities: CombatAbility[];

  beforeEach(async () => {
    // Initialize all services
    combatStateMachine = new CombatStateMachine();
    abilitySystem = new AbilitySystem();
    dodgeMechanic = new DodgeMechanic();
    phaseManager = new PhaseManager();
    progressionService = new CombatProgressionService();
    economyService = new CombatEconomyService();
    analyticsService = new CombatAnalyticsService();
    repository = new SessionV2Repository();

    orchestrator = new SessionV2Orchestrator(
      combatStateMachine,
      abilitySystem,
      dodgeMechanic,
      phaseManager
    );

    // Setup test data
    testAbilities = [
      {
        id: 'FOCUS_STRIKE',
        name: 'Focus Strike',
        description: 'Basic damage ability',
        icon: 'sword',
        type: 'DAMAGE',
        baseDamage: 50,
        focusEnergyCost: 10,
        cooldownDuration: 2000,
        effects: [],
        requirements: [],
      },
      {
        id: 'DEEP_WORK_PUNCH',
        name: 'Deep Work Punch',
        description: 'Heavy damage ability',
        icon: 'fist',
        type: 'DAMAGE',
        baseDamage: 100,
        focusEnergyCost: 25,
        cooldownDuration: 5000,
        effects: [],
        requirements: [],
      },
    ];

    testBoss = {
      id: 'test-boss-1',
      bossId: 'distraction-demon',
      bossName: 'Distraction Demon',
      bossAvatarUrl: null,
      tier: 'COMMON',
      currentPhase: 'CALM',
      bossMaxHealth: 1000,
      bossCurrentHealth: 1000,
      percentHealthRemaining: 100,
      status: 'ACTIVE',
      attackPatterns: [],
      specialAttacks: [],
      rewards: {
        xp: 100,
        coins: 50,
        items: [],
      },
    };

    testSession = {
      id: 'integration-test-session',
      userId: 'integration-test-user',
      status: 'ACTIVE',
      phase: 'FOCUS',
      config: {
        duration: 25 * 60 * 1000,
        breakDuration: 5 * 60 * 1000,
        longBreakDuration: 15 * 60 * 1000,
        longBreakInterval: 4,
      },
      currentInterval: 1,
      totalIntervals: 4,
      intervalsCompleted: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      startedAt: Date.now(),
      completedAt: undefined,
      elapsedTime: 0,
      completionPercentage: 0,
      interruptions: 0,
      pauses: 0,
      backgroundTime: 0,
      currentEncounter: testBoss,
      combatState: {
        phase: 'PREPARING',
        currentAttack: null,
        damageDealt: 0,
        abilitiesUsed: 0,
        energyConsumed: 0,
      },
      userResources: {
        focusEnergy: 100,
        maxFocusEnergy: 100,
        specialCharges: 3,
        energyRegenRate: 1,
      },
      activeAbilities: testAbilities,
      abilityCooldowns: {},
      comboCount: 0,
      comboMultiplier: 1.0,
      lastActionTime: 0,
      dodgeAttempts: 0,
      successfulDodges: 0,
      combatHistory: [],
    };

    // Set user IDs for services
    progressionService.setUserId(testSession.userId);
    economyService.setUserId(testSession.userId);
    analyticsService.setUserId(testSession.userId);
  });

  afterEach(() => {
    orchestrator.cleanup();
  });

  describe('Complete Session Workflow', () => {
    it('should handle full session lifecycle from start to completion', async () => {
      // Initialize session
      orchestrator.initialize(testSession);
      expect(orchestrator.getSessionState().status).toBe('ACTIVE');

      // Start session
      orchestrator.start();
      expect(combatStateMachine.getCurrentPhase()).toBe('PREPARING');

      // Simulate session progression
      const startTime = Date.now();
      const sessionDuration = 25 * 60 * 1000; // 25 minutes
      const updateInterval = 1000; // 1 second updates

      while (Date.now() - startTime < sessionDuration / 100) { // Speed up test
        const currentTime = Date.now();
        
        // Update orchestrator
        orchestrator.update(currentTime);

        // Simulate combat actions
        if (Math.random() < 0.1) { // 10% chance per update
          const abilityIndex = Math.floor(Math.random() * testAbilities.length);
          orchestrator.useAbility(testAbilities[abilityIndex].id);
        }

        if (Math.random() < 0.05) { // 5% chance per update
          orchestrator.attemptDodge();
        }

        await new Promise(resolve => setTimeout(resolve, updateInterval / 100));
      }

      // Complete session
      const finalState = orchestrator.getSessionState();
      expect(finalState.combatState.damageDealt).toBeGreaterThan(0);
      expect(finalState.combatState.abilitiesUsed).toBeGreaterThan(0);

      // Cleanup
      orchestrator.cleanup();
    });

    it('should integrate with progression system correctly', async () => {
      orchestrator.initialize(testSession);
      orchestrator.start();

      // Use abilities to generate XP
      orchestrator.useAbility('FOCUS_STRIKE');
      orchestrator.useAbility('DEEP_WORK_PUNCH');

      // Simulate session completion
      const sessionState = orchestrator.getSessionState();
      const xpBreakdown = progressionService.calculateCombatXP(sessionState);
      
      expect(xpBreakdown.totalXP).toBeGreaterThan(0);
      expect(xpBreakdown.combatXP).toBeGreaterThan(0);

      // Grant XP
      const levelUpReward = await progressionService.grantCombatXP(xpBreakdown);
      
      if (levelUpReward) {
        expect(levelUpReward.level).toBeGreaterThan(1);
        expect(levelUpReward.xpEarned).toBeGreaterThan(0);
      }
    });

    it('should integrate with economy system correctly', async () => {
      orchestrator.initialize(testSession);
      orchestrator.start();

      // Complete some combat actions
      orchestrator.useAbility('FOCUS_STRIKE');
      orchestrator.useAbility('DEEP_WORK_PUNCH');

      // Calculate rewards
      const sessionState = orchestrator.getSessionState();
      const xpBreakdown = progressionService.calculateCombatXP(sessionState);
      const rewards = economyService.calculateCombatRewards(sessionState, xpBreakdown, 1);

      expect(rewards.coins).toBeGreaterThan(0);
      expect(rewards.gems).toBeGreaterThanOrEqual(0);

      // Grant rewards
      const transactions = await economyService.grantCombatRewards(rewards, sessionState.id || '');
      expect(transactions.length).toBeGreaterThan(0);

      // Check balance
      const balance = economyService.getUserBalance();
      expect(balance.coins).toBeGreaterThan(0);
    });

    it('should integrate with analytics system correctly', async () => {
      orchestrator.initialize(testSession);
      orchestrator.start();

      // Perform combat actions
      orchestrator.useAbility('FOCUS_STRIKE');
      orchestrator.attemptDodge();
      orchestrator.useAbility('DEEP_WORK_PUNCH');

      // Track session
      const sessionState = orchestrator.getSessionState();
      const metrics = analyticsService.trackSession(sessionState);

      expect(metrics.totalDamage).toBeGreaterThan(0);
      expect(metrics.abilitiesUsed).toBeGreaterThan(0);
      expect(metrics.sessionId).toBe(sessionState.id);

      // Generate summary
      const summary = analyticsService.generateAnalyticsSummary();
      expect(summary.totalSessions).toBeGreaterThan(0);
      expect(summary.averageDamagePerMinute).toBeGreaterThanOrEqual(0);
    });

    it('should integrate with repository system correctly', async () => {
      orchestrator.initialize(testSession);
      orchestrator.start();

      // Perform some actions
      orchestrator.useAbility('FOCUS_STRIKE');
      orchestrator.attemptDodge();

      // Save session
      const sessionState = orchestrator.getSessionState();
      await repository.saveSession(sessionState);

      // Save combat history
      await repository.saveCombatHistory(
        sessionState.id || '',
        sessionState.userId,
        sessionState.combatHistory,
        sessionState
      );

      // Verify repository is healthy
      const isHealthy = await repository.isHealthy();
      expect(isHealthy).toBe(true);
    });
  });

  describe('Combat Flow Integration', () => {
    it('should handle complete combat flow from start to victory', async () => {
      orchestrator.initialize(testSession);
      orchestrator.start();

      // Progress through combat phases
      const phases = ['PREPARING', 'COMBAT_ACTIVE', 'BOSS_RAGE', 'VICTORY'];
      
      for (const phase of phases) {
        // Simulate phase progression
        orchestrator.update(Date.now());
        
        // Use abilities in each phase
        orchestrator.useAbility('FOCUS_STRIKE');
        
        // Attempt dodges when attacks occur
        if (phase === 'COMBAT_ACTIVE' || phase === 'BOSS_RAGE') {
          orchestrator.attemptDodge();
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Verify final state
      const finalState = orchestrator.getSessionState();
      expect(finalState.combatState.damageDealt).toBeGreaterThan(0);
      expect(finalState.currentEncounter?.status).toBe('VICTORY');
    });

    it('should handle combat defeat flow correctly', async () => {
      // Create a session that will be defeated
      const defeatSession = {
        ...testSession,
        currentEncounter: {
          ...testBoss,
          bossCurrentHealth: 0,
          percentHealthRemaining: 0,
          status: 'DEFEAT' as const,
        },
      };

      orchestrator.initialize(defeatSession);
      orchestrator.start();

      // Update session
      orchestrator.update(Date.now());

      // Verify defeat state
      const state = orchestrator.getSessionState();
      expect(state.currentEncounter?.status).toBe('DEFEAT');
    });

    it('should handle combo system integration correctly', async () => {
      orchestrator.initialize(testSession);
      orchestrator.start();

      // Build combo by using abilities quickly
      const comboStartTime = Date.now();
      
      orchestrator.useAbility('FOCUS_STRIKE');
      await new Promise(resolve => setTimeout(resolve, 50));
      
      orchestrator.useAbility('DEEP_WORK_PUNCH');
      await new Promise(resolve => setTimeout(resolve, 50));
      
      orchestrator.useAbility('FOCUS_STRIKE');

      // Check combo state
      const state = orchestrator.getSessionState();
      expect(state.comboCount).toBeGreaterThan(1);
      expect(state.comboMultiplier).toBeGreaterThan(1.0);
    });

    it('should handle energy management integration correctly', async () => {
      orchestrator.initialize(testSession);
      orchestrator.start();

      // Use abilities until energy is depleted
      let energyUsed = 0;
      const maxEnergy = testSession.userResources.maxFocusEnergy;

      while (energyUsed < maxEnergy) {
        const ability = testAbilities[0]; // Use cheapest ability
        const success = orchestrator.useAbility(ability.id);
        
        if (success) {
          energyUsed += ability.focusEnergyCost;
        } else {
          break; // Can't use ability (no energy)
        }

        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // Check energy state
      const state = orchestrator.getSessionState();
      expect(state.userResources.focusEnergy).toBeLessThan(maxEnergy);
    });
  });

  describe('Event Integration', () => {
    it('should publish and handle events correctly throughout session', async () => {
      const { eventBus } = require('../../../events');
      
      orchestrator.initialize(testSession);
      orchestrator.start();

      // Clear previous calls
      eventBus.publish.mockClear();

      // Perform various actions
      orchestrator.useAbility('FOCUS_STRIKE');
      orchestrator.attemptDodge();
      orchestrator.skipCurrentPhase();

      // Check events were published
      expect(eventBus.publish).toHaveBeenCalledWith(
        'session:v2:ability_used',
        expect.any(Object)
      );
      
      expect(eventBus.publish).toHaveBeenCalledWith(
        'session:v2:dodge_attempted',
        expect.any(Object)
      );
      
      expect(eventBus.publish).toHaveBeenCalledWith(
        'session:v2:phase_changed',
        expect.any(Object)
      );
    });

    it('should handle event subscription and cleanup correctly', async () => {
      const { eventBus } = require('../../../events');
      
      orchestrator.initialize(testSession);
      orchestrator.start();

      // Verify event subscriptions
      expect(eventBus.subscribe).toHaveBeenCalled();

      // Cleanup
      orchestrator.cleanup();

      // Verify event unsubscriptions
      expect(eventBus.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('Error Recovery Integration', () => {
    it('should handle service failures gracefully', async () => {
      // Mock service failures
      jest.spyOn(repository, 'saveSession').mockRejectedValue(new Error('Database error'));
      jest.spyOn(progressionService, 'grantCombatXP').mockRejectedValue(new Error('Progression error'));

      orchestrator.initialize(testSession);
      orchestrator.start();

      // Perform actions that would trigger service calls
      orchestrator.useAbility('FOCUS_STRIKE');
      orchestrator.update(Date.now());

      // Session should still be functional despite service failures
      const state = orchestrator.getSessionState();
      expect(state.status).toBe('ACTIVE');
      expect(state.combatState.damageDealt).toBeGreaterThan(0);
    });

    it('should handle partial session recovery correctly', async () => {
      // Create a corrupted session
      const corruptedSession = {
        ...testSession,
        userResources: {
          focusEnergy: -10, // Invalid
          maxFocusEnergy: 100,
          specialCharges: 3,
          energyRegenRate: 1,
        },
      };

      // Should initialize without crashing
      expect(() => {
        orchestrator.initialize(corruptedSession);
        orchestrator.start();
      }).not.toThrow();

      // Should auto-correct invalid state
      const state = orchestrator.getSessionState();
      expect(state.userResources.focusEnergy).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Performance Integration', () => {
    it('should handle high-frequency updates efficiently', async () => {
      orchestrator.initialize(testSession);
      orchestrator.start();

      const startTime = performance.now();
      const updateCount = 1000;

      // Perform rapid updates
      for (let i = 0; i < updateCount; i++) {
        orchestrator.update(Date.now() + i);
        
        if (i % 100 === 0) {
          orchestrator.useAbility('FOCUS_STRIKE');
        }
      }

      const endTime = performance.now();
      const averageUpdateTime = (endTime - startTime) / updateCount;

      // Should average less than 1ms per update
      expect(averageUpdateTime).toBeLessThan(1);
    });

    it('should handle memory usage correctly during long sessions', async () => {
      orchestrator.initialize(testSession);
      orchestrator.start();

      const initialMemory = process.memoryUsage().heapUsed;

      // Simulate long session with many actions
      for (let i = 0; i < 1000; i++) {
        orchestrator.update(Date.now() + i * 1000);
        orchestrator.useAbility('FOCUS_STRIKE');
        
        if (i % 10 === 0) {
          orchestrator.attemptDodge();
        }
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
    });
  });

  describe('Cross-Service Integration', () => {
    it('should coordinate between all services correctly', async () => {
      orchestrator.initialize(testSession);
      orchestrator.start();

      // Simulate complete session
      const sessionDuration = 5000; // 5 seconds for test
      const startTime = Date.now();

      while (Date.now() - startTime < sessionDuration) {
        orchestrator.update(Date.now());
        
        if (Math.random() < 0.3) {
          orchestrator.useAbility('FOCUS_STRIKE');
        }
        
        if (Math.random() < 0.1) {
          orchestrator.attemptDodge();
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Get final session state
      const sessionState = orchestrator.getSessionState();

      // Verify all services have consistent data
      expect(sessionState.combatState.damageDealt).toBeGreaterThan(0);
      expect(sessionState.combatState.abilitiesUsed).toBeGreaterThan(0);

      // Verify progression service has tracked XP
      const xpBreakdown = progressionService.calculateCombatXP(sessionState);
      expect(xpBreakdown.totalXP).toBeGreaterThan(0);

      // Verify economy service has calculated rewards
      const rewards = economyService.calculateCombatRewards(sessionState, xpBreakdown, 1);
      expect(rewards.coins).toBeGreaterThan(0);

      // Verify analytics service has tracked metrics
      const metrics = analyticsService.trackSession(sessionState);
      expect(metrics.totalDamage).toBe(sessionState.combatState.damageDealt);
    });
  });
});
