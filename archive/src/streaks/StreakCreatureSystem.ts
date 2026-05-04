/**
 * Streak Creature System
 *
 * Phase 5: Retention Systems
 * Replaces abstract streak number with living, evolving creature
 *
 * The creature evolves based on streak length:
 * - 1-7 days: Flame (small → growing fire)
 * - 8-30 days: Sapling (seed → sprout → small tree)
 * - 31-90 days: Tree (growing, seasonal changes)
 * - 90+ days: Dragon (rare colors, majestic)
 *
 * Near-break drama:
 * - 40+ hours: Creature looks "sick"
 * - 46 hours: Emergency quest offered
 * - 47 hours: Last-chance notification (creature crying)
 * - 48 hours: Creature "dies" (can be revived with gems)
 *
 * Dependencies:
 * - streaks/StreakService (streak data)
 * - economy/EmergencyGemSinks (revive purchases)
 * - feature-flags (gradual rollout)
 */

import { z } from 'zod';
import { featureFlags } from '../feature-flags/FeatureFlagEngine';
import { eventBus } from '../events';
import { getEmergencyGemSinksService } from '../economy/EmergencyGemSinks';

// ============================================================================
// Creature Evolution Stages
// ============================================================================

export type CreatureStage = 'FLAME' | 'SAPLING' | 'TREE' | 'DRAGON';

export interface CreatureEvolutionConfig {
  stage: CreatureStage;
  minDays: number;
  maxDays: number;
  name: string;
  description: string;
  emoji: string;
  color: string;
  animationSpeed: number;
  particleCount: number;
}

export const CREATURE_EVOLUTION_STAGES: CreatureEvolutionConfig[] = [
  {
    stage: 'FLAME',
    minDays: 1,
    maxDays: 7,
    name: 'Ember',
    description: 'A small flame that grows with each day',
    emoji: '🔥',
    color: '#EF4444', // red-500
    animationSpeed: 1,
    particleCount: 5,
  },
  {
    stage: 'SAPLING',
    minDays: 8,
    maxDays: 30,
    name: 'Sprout',
    description: 'A young plant reaching for the sun',
    emoji: '🌱',
    color: '#10B981', // emerald-500
    animationSpeed: 0.8,
    particleCount: 10,
  },
  {
    stage: 'TREE',
    minDays: 31,
    maxDays: 90,
    name: 'Ancient Oak',
    description: 'A mighty tree that stands through seasons',
    emoji: '🌳',
    color: '#059669', // emerald-600
    animationSpeed: 0.5,
    particleCount: 20,
  },
  {
    stage: 'DRAGON',
    minDays: 91,
    maxDays: Infinity,
    name: 'Focus Dragon',
    description: 'A legendary creature of pure discipline',
    emoji: '🐉',
    color: '#7C3AED', // violet-600
    animationSpeed: 0.3,
    particleCount: 40,
  },
];

// ============================================================================
// Creature State & Health
// ============================================================================

export const StreakCreatureStateSchema = z.object({
  userId: z.string(),

  // Evolution
  currentStreak: z.number().min(0),
  longestStreak: z.number().min(0),
  currentStage: z.enum(['FLAME', 'SAPLING', 'TREE', 'DRAGON']),
  daysInCurrentStage: z.number().min(0),

  // Visual state (0-100)
  healthPercent: z.number().min(0).max(100),
  happinessPercent: z.number().min(0).max(100),
  energyPercent: z.number().min(0).max(100),

  // Near-break tracking
  hoursSinceLastSession: z.number().min(0),
  isAtRisk: z.boolean(),
  riskLevel: z.enum(['NONE', 'WARNING', 'DANGER', 'CRITICAL']),

  // Death & Revival
  isDead: z.boolean(),
  diedAt: z.number().nullable(),
  revivalCost: z.number().min(0),
  canRevive: z.boolean(),

  // Special states
  isSick: z.boolean(),
  isCrying: z.boolean(),
  isCelebrating: z.boolean(),

  // Metadata
  lastFedAt: z.number(), // timestamp
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type StreakCreatureState = z.infer<typeof StreakCreatureStateSchema>;

// ============================================================================
// Creature System Service
// ============================================================================

export class StreakCreatureSystem {
  private creatures: Map<string, StreakCreatureState> = new Map();

  /**
   * Check if creature system is enabled
   */
  static isEnabled(): boolean {
    return featureFlags.isEnabled('streak_creature_system');
  }

  /**
   * Initialize or update creature for a user
   */
  updateCreature(
    userId: string,
    currentStreak: number,
    longestStreak: number,
    hoursSinceLastSession: number
  ): StreakCreatureState {
    if (!StreakCreatureSystem.isEnabled()) {
      return this.getDefaultState(userId);
    }

    const existing = this.creatures.get(userId);
    const stage = this.calculateStage(currentStreak);
    const daysInStage = existing?.currentStage === stage
      ? existing.daysInCurrentStage
      : 0;

    // Calculate health based on time since last session
    const healthPercent = this.calculateHealth(hoursSinceLastSession);
    const riskLevel = this.calculateRiskLevel(hoursSinceLastSession);
    const isAtRisk = riskLevel !== 'NONE';

    // Check if dead (48+ hours)
    const isDead = hoursSinceLastSession >= 48;
    const diedAt = isDead && !existing?.isDead ? Date.now() : (existing?.diedAt || null);

    // Visual states
    const isSick = hoursSinceLastSession >= 40 && !isDead;
    const isCrying = hoursSinceLastSession >= 47 && !isDead;
    const isCelebrating = hoursSinceLastSession < 24 && currentStreak > 0;

    // Revival cost increases with streak length
    const revivalCost = this.calculateRevivalCost(currentStreak);
    const canRevive = isDead && currentStreak > 0;

    const state: StreakCreatureState = {
      userId,
      currentStreak,
      longestStreak,
      currentStage: stage,
      daysInCurrentStage: daysInStage,
      healthPercent,
      happinessPercent: isDead ? 0 : Math.max(20, 100 - hoursSinceLastSession * 2),
      energyPercent: isDead ? 0 : Math.max(10, 100 - hoursSinceLastSession * 1.5),
      hoursSinceLastSession,
      isAtRisk,
      riskLevel,
      isDead,
      diedAt,
      revivalCost,
      canRevive,
      isSick,
      isCrying,
      isCelebrating,
      lastFedAt: isDead ? (existing?.lastFedAt || Date.now()) : Date.now(),
      createdAt: existing?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    this.creatures.set(userId, state);

    // Emit state change events
    this.emitStateEvents(userId, state, existing);

    return state;
  }

  /**
   * Get creature state for a user
   */
  getCreature(userId: string): StreakCreatureState | null {
    return this.creatures.get(userId) || null;
  }

  /**
   * Attempt to revive a dead creature
   */
  reviveCreature(userId: string, userGems: number): {
    success: boolean;
    cost: number;
    remainingGems: number;
    message: string;
  } {
    const creature = this.creatures.get(userId);
    if (!creature || !creature.isDead) {
      return {
        success: false,
        cost: 0,
        remainingGems: userGems,
        message: 'Creature is not dead',
      };
    }

    if (userGems < creature.revivalCost) {
      return {
        success: false,
        cost: creature.revivalCost,
        remainingGems: userGems,
        message: `Not enough gems. Need ${creature.revivalCost - userGems} more.`,
      };
    }

    // Revive the creature
    const newGems = userGems - creature.revivalCost;
    creature.isDead = false;
    creature.diedAt = null;
    creature.healthPercent = 50; // Revive at half health
    creature.hoursSinceLastSession = 0;
    creature.isSick = false;
    creature.isCrying = false;
    creature.updatedAt = Date.now();

    // Emit revival event
    eventBus.publish('creature:revived', {
      userId,
      cost: creature.revivalCost,
      streakPreserved: creature.currentStreak,
    });

    return {
      success: true,
      cost: creature.revivalCost,
      remainingGems: newGems,
      message: `${this.getCreatureDisplayName(creature)} has been revived!`,
    };
  }

  /**
   * Get creature display info for UI
   */
  getCreatureDisplay(userId: string): {
    stage: CreatureEvolutionConfig;
    state: StreakCreatureState | null;
    displayName: string;
    statusMessage: string;
    animationState: 'idle' | 'happy' | 'sick' | 'crying' | 'dead' | 'celebrating';
    particles: number;
    color: string;
  } {
    const state = this.creatures.get(userId);
    if (!state) {
      return {
        stage: CREATURE_EVOLUTION_STAGES[0],
        state: null,
        displayName: 'No Creature',
        statusMessage: 'Start a streak to hatch your creature!',
        animationState: 'idle',
        particles: 0,
        color: '#6B7280',
      };
    }

    const stage = CREATURE_EVOLUTION_STAGES.find(s => s.stage === state.currentStage)!;

    let animationState: 'idle' | 'happy' | 'sick' | 'crying' | 'dead' | 'celebrating' = 'idle';
    if (state.isDead) animationState = 'dead';
    else if (state.isCrying) animationState = 'crying';
    else if (state.isSick) animationState = 'sick';
    else if (state.isCelebrating) animationState = 'celebrating';
    else if (state.happinessPercent > 70) animationState = 'happy';

    const statusMessage = this.getStatusMessage(state);

    return {
      stage,
      state,
      displayName: this.getCreatureDisplayName(state),
      statusMessage,
      animationState,
      particles: state.isDead ? 0 : stage.particleCount * (state.healthPercent / 100),
      color: state.isDead ? '#4B5563' : stage.color,
    };
  }

  /**
   * Get near-break intervention for at-risk creatures
   */
  getIntervention(userId: string): {
    shouldIntervene: boolean;
    urgency: 1 | 2 | 3;
    message: string;
    action: string;
  } | null {
    const state = this.creatures.get(userId);
    if (!state || !state.isAtRisk || state.isDead) return null;

    const hours = state.hoursSinceLastSession;

    if (hours >= 47) {
      return {
        shouldIntervene: true,
        urgency: 3,
        message: `${this.getCreatureDisplayName(state)} is crying! Complete a session in the next hour or your streak will break!`,
        action: 'complete_session_now',
      };
    }

    if (hours >= 46) {
      return {
        shouldIntervene: true,
        urgency: 3,
        message: `${this.getCreatureDisplayName(state)} looks very worried... Only 2 hours left!`,
        action: 'complete_session_soon',
      };
    }

    if (hours >= 40) {
      return {
        shouldIntervene: true,
        urgency: 2,
        message: `${this.getCreatureDisplayName(state)} is getting sick. Your streak is at risk!`,
        action: 'protect_streak',
      };
    }

    if (hours >= 36) {
      return {
        shouldIntervene: true,
        urgency: 1,
        message: `${this.getCreatureDisplayName(state)} misses you. Don't forget your streak!`,
        action: 'reminder',
      };
    }

    return null;
  }

  // ============================================================================
  // Private Helpers
  // ============================================================================

  private calculateStage(streakDays: number): CreatureStage {
    for (const stage of CREATURE_EVOLUTION_STAGES) {
      if (streakDays >= stage.minDays && streakDays <= stage.maxDays) {
        return stage.stage;
      }
    }
    return 'DRAGON';
  }

  private calculateHealth(hoursSinceLastSession: number): number {
    // Linear decay: 100% at 0 hours, 0% at 48 hours
    return Math.max(0, 100 - (hoursSinceLastSession / 48) * 100);
  }

  private calculateRiskLevel(hoursSinceLastSession: number): StreakCreatureState['riskLevel'] {
    if (hoursSinceLastSession >= 48) return 'CRITICAL';
    if (hoursSinceLastSession >= 40) return 'DANGER';
    if (hoursSinceLastSession >= 24) return 'WARNING';
    return 'NONE';
  }

  private calculateRevivalCost(streakDays: number): number {
    // Base 50 gems + 10 per streak day (caps at 500)
    return Math.min(500, 50 + streakDays * 10);
  }

  private getCreatureDisplayName(state: StreakCreatureState): string {
    const stage = CREATURE_EVOLUTION_STAGES.find(s => s.stage === state.currentStage);
    if (!stage) return 'Creature';

    // Add adjectives based on state
    if (state.isDead) return `Dead ${stage.name}`;
    if (state.isCrying) return `Crying ${stage.name}`;
    if (state.isSick) return `Sick ${stage.name}`;
    if (state.isCelebrating) return `Happy ${stage.name}`;
    if (state.healthPercent > 80) return `Thriving ${stage.name}`;
    return stage.name;
  }

  private getStatusMessage(state: StreakCreatureState): string {
    if (state.isDead) {
      return `Your ${this.getCreatureDisplayName(state)} has died. Spend ${state.revivalCost} gems to revive it and save your ${state.currentStreak}-day streak!`;
    }

    if (state.isCrying) {
      return 'Your creature is crying! Complete a session in the next hour!';
    }

    if (state.isSick) {
      return 'Your creature is getting sick. Your streak is at risk!';
    }

    if (state.isCelebrating) {
      return `Your ${this.getCreatureDisplayName(state)} is celebrating your ${state.currentStreak}-day streak!`;
    }

    if (state.happinessPercent > 80) {
      return `Your ${this.getCreatureDisplayName(state)} is thriving! Keep up the great work!`;
    }

    return `Your ${this.getCreatureDisplayName(state)} is doing well. Don't forget your streak!`;
  }

  private getDefaultState(userId: string): StreakCreatureState {
    return {
      userId,
      currentStreak: 0,
      longestStreak: 0,
      currentStage: 'FLAME',
      daysInCurrentStage: 0,
      healthPercent: 0,
      happinessPercent: 0,
      energyPercent: 0,
      hoursSinceLastSession: 999,
      isAtRisk: false,
      riskLevel: 'NONE',
      isDead: false,
      diedAt: null,
      revivalCost: 0,
      canRevive: false,
      isSick: false,
      isCrying: false,
      isCelebrating: false,
      lastFedAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  /**
   * Restore creature from persisted state
   */
  restoreFromState(state: StreakCreatureState): void {
    this.creatures.set(state.userId, state);
  }

  private emitStateEvents(
    userId: string,
    newState: StreakCreatureState,
    oldState: StreakCreatureState | undefined
  ): void {
    // Stage evolution
    if (oldState?.currentStage !== newState.currentStage) {
      eventBus.publish('creature:evolved', {
        userId,
        creatureId: 'creature_' + userId,
        newLevel: newState.currentStage,
      });
    }

    // Death
    if (!oldState?.isDead && newState.isDead) {
      eventBus.publish('creature:died', {
        userId,
        creatureId: 'creature_' + userId,
        streakLost: newState.currentStreak,
        revivalCost: newState.revivalCost,
      });

      // Trigger emergency gem sink
      const emergencyService = getEmergencyGemSinksService();
      emergencyService.triggerEmergency(
        userId,
        'STREAK_AT_RISK',
        { streakDays: newState.currentStreak, creatureDied: true },
        3
      );
    }

    // Near-break warnings
    if (newState.isCrying && !oldState?.isCrying) {
      eventBus.publish('creature:crying', {
        userId,
        creatureId: 'creature_' + userId,
        sadnessLevel: newState.sadnessLevel || 50,
      });
    }

    // Risk level changes
    if (oldState?.riskLevel !== newState.riskLevel && newState.riskLevel !== 'NONE') {
      eventBus.publish('creature:risk_increased', {
        userId,
        creatureId: 'creature_' + userId,
        riskLevel: newState.riskLevel,
      });
    }
  }
}

// ============================================================================
// Factory & Singleton
// ============================================================================

let creatureSystem: StreakCreatureSystem | null = null;

export function getStreakCreatureSystem(): StreakCreatureSystem {
  if (!creatureSystem) {
    creatureSystem = new StreakCreatureSystem();
  }
  return creatureSystem;
}
