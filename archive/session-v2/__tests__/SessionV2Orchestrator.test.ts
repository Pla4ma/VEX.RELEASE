/**
 * Session V2 Orchestrator Tests
 * 
 * Unit tests for the SessionV2Orchestrator class.
 * Tests session lifecycle, combat integration, and event handling.
 */

import { SessionV2Orchestrator } from '../SessionV2Orchestrator';
import { CombatStateMachine } from '../CombatStateMachine';
import { AbilitySystem } from '../AbilitySystem';
import { DodgeMechanic } from '../DodgeMechanic';
import { PhaseManager } from '../PhaseManager';
import type { SessionV2State, CombatAbility, BossEncounter } from '../types';

// Mock dependencies
jest.mock('../../events', () => ({
  eventBus: {
    publish: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
  },
}));

jest.mock('../../utils/debug', () => ({
  createDebugger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

describe('SessionV2Orchestrator', () => {
  let orchestrator: SessionV2Orchestrator;
  let mockCombatStateMachine: jest.Mocked<CombatStateMachine>;
  let mockAbilitySystem: jest.Mocked<AbilitySystem>;
  let mockDodgeMechanic: jest.Mocked<DodgeMechanic>;
  let mockPhaseManager: jest.Mocked<PhaseManager>;

  const mockSession: SessionV2State = {
    id: 'test-session-1',
    userId: 'test-user-1',
    status: 'ACTIVE',
    phase: 'FOCUS',
    config: {
      duration: 25 * 60 * 1000, // 25 minutes
      breakDuration: 5 * 60 * 1000, // 5 minutes
      longBreakDuration: 15 * 60 * 1000, // 15 minutes
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
    currentEncounter: null,
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
    activeAbilities: [],
    abilityCooldowns: {},
    comboCount: 0,
    comboMultiplier: 1.0,
    lastActionTime: 0,
    dodgeAttempts: 0,
    successfulDodges: 0,
    combatHistory: [],
  };

  beforeEach(() => {
    // Create mock dependencies
    mockCombatStateMachine = {
      initialize: jest.fn(),
      start: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      cleanup: jest.fn(),
      update: jest.fn(),
      getCurrentPhase: jest.fn().mockReturnValue('PREPARING'),
      scheduleAttack: jest.fn(),
      endAttack: jest.fn(),
    } as any;

    mockAbilitySystem = {
      initialize: jest.fn(),
      start: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      cleanup: jest.fn(),
      update: jest.fn(),
      useAbility: jest.fn().mockReturnValue(true),
      getAbilityCooldown: jest.fn().mockReturnValue(0),
      canUseAbility: jest.fn().mockReturnValue(true),
      getActiveAbilities: jest.fn().mockReturnValue([]),
    } as any;

    mockDodgeMechanic = {
      initialize: jest.fn(),
      start: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      cleanup: jest.fn(),
      attemptDodge: jest.fn().mockReturnValue({ success: true, damage: 0 }),
      getCurrentDodgeWindow: jest.fn().mockReturnValue(null),
    } as any;

    mockPhaseManager = {
      initialize: jest.fn(),
      start: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      cleanup: jest.fn(),
      update: jest.fn(),
      getCurrentPhase: jest.fn().mockReturnValue('FOCUS'),
      skipCurrentPhase: jest.fn().mockReturnValue(true),
      extendCurrentPhase: jest.fn().mockReturnValue(true),
      getPhaseStats: jest.fn().mockReturnValue({
        currentPhase: 'FOCUS',
        timeRemaining: 1500000,
        progress: 25,
        currentInterval: 1,
        totalIntervals: 4,
        intervalsCompleted: 0,
      }),
    } as any;

    orchestrator = new SessionV2Orchestrator(
      mockCombatStateMachine,
      mockAbilitySystem,
      mockDodgeMechanic,
      mockPhaseManager
    );
  });

  afterEach(() => {
    orchestrator.cleanup();
  });

  describe('Initialization', () => {
    it('should initialize with provided dependencies', () => {
      expect(orchestrator).toBeDefined();
    });

    it('should initialize session with valid state', () => {
      orchestrator.initialize(mockSession);
      expect(mockCombatStateMachine.initialize).toHaveBeenCalledWith(mockSession);
      expect(mockAbilitySystem.initialize).toHaveBeenCalledWith(mockSession);
      expect(mockDodgeMechanic.initialize).toHaveBeenCalledWith(mockSession);
      expect(mockPhaseManager.initialize).toHaveBeenCalledWith(mockSession);
    });

    it('should throw error with invalid session state', () => {
      const invalidSession = { ...mockSession, id: '' };
      expect(() => orchestrator.initialize(invalidSession)).toThrow();
    });
  });

  describe('Session Lifecycle', () => {
    beforeEach(() => {
      orchestrator.initialize(mockSession);
    });

    it('should start session successfully', () => {
      orchestrator.start();
      expect(mockCombatStateMachine.start).toHaveBeenCalled();
      expect(mockAbilitySystem.start).toHaveBeenCalled();
      expect(mockDodgeMechanic.start).toHaveBeenCalled();
      expect(mockPhaseManager.start).toHaveBeenCalled();
    });

    it('should pause session successfully', () => {
      orchestrator.start();
      orchestrator.pause();
      expect(mockCombatStateMachine.pause).toHaveBeenCalled();
      expect(mockAbilitySystem.pause).toHaveBeenCalled();
      expect(mockDodgeMechanic.pause).toHaveBeenCalled();
      expect(mockPhaseManager.pause).toHaveBeenCalled();
    });

    it('should resume session successfully', () => {
      orchestrator.start();
      orchestrator.pause();
      orchestrator.resume();
      expect(mockCombatStateMachine.resume).toHaveBeenCalled();
      expect(mockAbilitySystem.resume).toHaveBeenCalled();
      expect(mockDodgeMechanic.resume).toHaveBeenCalled();
      expect(mockPhaseManager.resume).toHaveBeenCalled();
    });

    it('should cleanup session successfully', () => {
      orchestrator.cleanup();
      expect(mockCombatStateMachine.cleanup).toHaveBeenCalled();
      expect(mockAbilitySystem.cleanup).toHaveBeenCalled();
      expect(mockDodgeMechanic.cleanup).toHaveBeenCalled();
      expect(mockPhaseManager.cleanup).toHaveBeenCalled();
    });
  });

  describe('Combat Integration', () => {
    beforeEach(() => {
      orchestrator.initialize(mockSession);
      orchestrator.start();
    });

    it('should handle ability usage', () => {
      const mockAbility: CombatAbility = {
        id: 'test-ability',
        name: 'Test Ability',
        description: 'Test ability for unit testing',
        icon: 'test-icon',
        type: 'DAMAGE',
        baseDamage: 50,
        focusEnergyCost: 10,
        cooldownDuration: 5000,
        effects: [],
        requirements: [],
      };

      orchestrator.useAbility('test-ability');
      expect(mockAbilitySystem.useAbility).toHaveBeenCalledWith('test-ability');
    });

    it('should handle dodge attempts', () => {
      orchestrator.attemptDodge();
      expect(mockDodgeMechanic.attemptDodge).toHaveBeenCalled();
    });

    it('should handle phase transitions', () => {
      orchestrator.skipCurrentPhase();
      expect(mockPhaseManager.skipCurrentPhase).toHaveBeenCalled();

      orchestrator.extendCurrentPhase(30000);
      expect(mockPhaseManager.extendCurrentPhase).toHaveBeenCalledWith(30000);
    });
  });

  describe('Session State Management', () => {
    beforeEach(() => {
      orchestrator.initialize(mockSession);
    });

    it('should return current session state', () => {
      const state = orchestrator.getSessionState();
      expect(state).toBeDefined();
      expect(state.id).toBe(mockSession.id);
      expect(state.userId).toBe(mockSession.userId);
    });

    it('should update session state correctly', () => {
      const timestamp = Date.now();
      orchestrator.update(timestamp);
      expect(mockCombatStateMachine.update).toHaveBeenCalledWith(timestamp);
      expect(mockAbilitySystem.update).toHaveBeenCalledWith(timestamp);
      expect(mockDodgeMechanic.update).toHaveBeenCalledWith(timestamp);
      expect(mockPhaseManager.update).toHaveBeenCalledWith(timestamp);
    });

    it('should calculate session completion correctly', () => {
      const completion = orchestrator.calculateCompletion();
      expect(typeof completion).toBe('number');
      expect(completion).toBeGreaterThanOrEqual(0);
      expect(completion).toBeLessThanOrEqual(100);
    });
  });

  describe('Event Handling', () => {
    beforeEach(() => {
      orchestrator.initialize(mockSession);
      orchestrator.start();
    });

    it('should publish events on ability usage', () => {
      const { eventBus } = require('../../events');
      orchestrator.useAbility('test-ability');
      expect(eventBus.publish).toHaveBeenCalledWith(
        'session:v2:ability_used',
        expect.objectContaining({
          sessionId: mockSession.id,
          userId: mockSession.userId,
          abilityId: 'test-ability',
        })
      );
    });

    it('should publish events on dodge attempts', () => {
      const { eventBus } = require('../../events');
      orchestrator.attemptDodge();
      expect(eventBus.publish).toHaveBeenCalledWith(
        'session:v2:dodge_attempted',
        expect.objectContaining({
          sessionId: mockSession.id,
          userId: mockSession.userId,
        })
      );
    });

    it('should publish events on phase changes', () => {
      const { eventBus } = require('../../events');
      orchestrator.skipCurrentPhase();
      expect(eventBus.publish).toHaveBeenCalledWith(
        'session:v2:phase_changed',
        expect.objectContaining({
          sessionId: mockSession.id,
          userId: mockSession.userId,
        })
      );
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      orchestrator.initialize(mockSession);
    });

    it('should handle ability usage errors gracefully', () => {
      mockAbilitySystem.useAbility.mockReturnValue(false);
      const result = orchestrator.useAbility('invalid-ability');
      expect(result).toBe(false);
    });

    it('should handle dodge attempt errors gracefully', () => {
      mockDodgeMechanic.attemptDodge.mockImplementation(() => {
        throw new Error('Dodge failed');
      });
      expect(() => orchestrator.attemptDodge()).not.toThrow();
    });

    it('should handle update errors gracefully', () => {
      mockCombatStateMachine.update.mockImplementation(() => {
        throw new Error('Update failed');
      });
      expect(() => orchestrator.update(Date.now())).not.toThrow();
    });
  });

  describe('Boss Encounters', () => {
    const mockBossEncounter: BossEncounter = {
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

    beforeEach(() => {
      const sessionWithBoss = {
        ...mockSession,
        currentEncounter: mockBossEncounter,
      };
      orchestrator.initialize(sessionWithBoss);
      orchestrator.start();
    });

    it('should handle boss damage correctly', () => {
      orchestrator.useAbility('test-ability');
      expect(mockAbilitySystem.useAbility).toHaveBeenCalled();
    });

    it('should handle boss phase transitions', () => {
      mockCombatStateMachine.getCurrentPhase.mockReturnValue('BOSS_RAGE');
      orchestrator.update(Date.now());
      expect(mockCombatStateMachine.getCurrentPhase).toHaveBeenCalled();
    });

    it('should handle boss defeat correctly', () => {
      const defeatedBoss = {
        ...mockBossEncounter,
        status: 'VICTORY' as const,
        bossCurrentHealth: 0,
        percentHealthRemaining: 0,
      };
      
      orchestrator.updateBossEncounter(defeatedBoss);
      const state = orchestrator.getSessionState();
      expect(state.currentEncounter?.status).toBe('VICTORY');
    });
  });

  describe('Performance', () => {
    beforeEach(() => {
      orchestrator.initialize(mockSession);
      orchestrator.start();
    });

    it('should handle rapid updates efficiently', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        orchestrator.update(Date.now() + i);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete 1000 updates in under 100ms
      expect(duration).toBeLessThan(100);
    });

    it('should handle memory usage correctly', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Create and destroy many sessions
      for (let i = 0; i < 100; i++) {
        const tempOrchestrator = new SessionV2Orchestrator(
          mockCombatStateMachine,
          mockAbilitySystem,
          mockDodgeMechanic,
          mockPhaseManager
        );
        tempOrchestrator.initialize({ ...mockSession, id: `temp-session-${i}` });
        tempOrchestrator.start();
        tempOrchestrator.cleanup();
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple start/stop cycles', () => {
      orchestrator.initialize(mockSession);
      
      for (let i = 0; i < 5; i++) {
        orchestrator.start();
        orchestrator.pause();
        orchestrator.resume();
        orchestrator.pause();
      }
      
      expect(mockCombatStateMachine.start).toHaveBeenCalledTimes(5);
      expect(mockCombatStateMachine.pause).toHaveBeenCalledTimes(10);
      expect(mockCombatStateMachine.resume).toHaveBeenCalledTimes(5);
    });

    it('should handle operations before initialization', () => {
      expect(() => orchestrator.start()).not.toThrow();
      expect(() => orchestrator.pause()).not.toThrow();
      expect(() => orchestrator.resume()).not.toThrow();
      expect(() => orchestrator.useAbility('test')).not.toThrow();
      expect(() => orchestrator.attemptDodge()).not.toThrow();
    });

    it('should handle operations after cleanup', () => {
      orchestrator.initialize(mockSession);
      orchestrator.start();
      orchestrator.cleanup();
      
      expect(() => orchestrator.start()).not.toThrow();
      expect(() => orchestrator.useAbility('test')).not.toThrow();
    });

    it('should handle invalid ability IDs', () => {
      orchestrator.initialize(mockSession);
      orchestrator.start();
      
      const result = orchestrator.useAbility('invalid-ability-id');
      expect(result).toBe(false);
    });

    it('should handle session state corruption', () => {
      const corruptedSession = {
        ...mockSession,
        userResources: {
          focusEnergy: -10, // Invalid negative energy
          maxFocusEnergy: 100,
          specialCharges: 3,
          energyRegenRate: 1,
        },
      };
      
      orchestrator.initialize(corruptedSession);
      expect(() => orchestrator.start()).not.toThrow();
    });
  });
});
