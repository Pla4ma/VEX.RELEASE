/**
 * Squad Energy System
 *
 * Phase 3: Social Systems Depth
 * Replaces deprecated Squad Synergy with true interdependence.
 *
 * Squads have a shared Energy Pool (0-1000) that:
 * - Depletes when members start sessions (consumes energy)
 * - Recharges based on member activity (daily regen + completions)
 * - Provides bonuses at high energy, penalties at low energy
 * - Creates social obligation: "Don't let the squad go dormant!"
 *
 * Dependencies:
 * - features/squads/types (Squad, SquadMember)
 * - feature-flags (gradual rollout)
 * - events (eventBus for energy updates)
 */

import { z } from 'zod';
import { featureFlags } from '../../feature-flags/FeatureFlagEngine';
import { eventBus } from '../../events';
import type { Squad, SquadMember } from './types';

// ============================================================================
// Energy System Constants
// ============================================================================

export const ENERGY_CONFIG = {
  MAX_ENERGY: 1000,
  MIN_ENERGY: 0,

  // Energy consumption
  SESSION_START_COST: 50,          // Energy consumed when starting a session
  CHALLENGE_START_COST: 100,       // Higher cost for squad challenges
  BOSS_RAID_COST: 150,             // Highest cost for boss raids

  // Energy regeneration
  DAILY_REGEN: 200,                // Auto-regen per day
  SESSION_COMPLETE_BONUS: 30,      // Energy gained when member completes session
  STREAK_MILESTONE_BONUS: 100,    // Energy gained on streak milestones

  // Thresholds for effects
  HIGH_ENERGY_THRESHOLD: 700,      // 70%+ = bonus active
  LOW_ENERGY_THRESHOLD: 300,       // 30%- = warning state
  DORMANT_THRESHOLD: 0,            // 0% = dormant (penalties)

  // Bonus multipliers
  HIGH_ENERGY_XP_MULTIPLIER: 1.25,
  HIGH_ENERGY_COIN_MULTIPLIER: 1.25,
  DORMANT_XP_PENALTY: 0.75,
  DORMANT_COIN_PENALTY: 0.75,

  // Dormancy
  DORMANT_MAX_DURATION_HOURS: 48,  // Squad can be dormant for max 48h before auto-disband
} as const;

// ============================================================================
// Types & Schemas
// ============================================================================

export const SquadEnergyStateSchema = z.object({
  squadId: z.string(),
  currentEnergy: z.number().min(0).max(1000),
  maxEnergy: z.number().default(1000),

  // Daily tracking
  energyConsumedToday: z.number().min(0).default(0),
  energyRegeneratedToday: z.number().min(0).default(0),
  lastResetAt: z.number().default(Date.now),

  // Dormancy state
  isDormant: z.boolean().default(false),
  dormantSince: z.number().nullable().default(null),
  dormantWarningSent: z.boolean().default(false),

  // Bonuses
  highEnergyBonusActive: z.boolean().default(false),
  bonusMultiplier: z.number().default(1),

  // Stats
  totalSessionsPowered: z.number().default(0),
  totalChallengesCompleted: z.number().default(0),
  daysSinceLastDormant: z.number().default(999),

  updatedAt: z.number().default(Date.now),
});

export type SquadEnergyState = z.infer<typeof SquadEnergyStateSchema>;

export interface EnergyActivity {
  id: string;
  squadId: string;
  userId: string;
  type: 'CONSUME' | 'REGEN' | 'BONUS' | 'MIGRATION';
  amount: number;
  reason: string;
  timestamp: number;
}

export interface EnergyEffect {
  type: 'BONUS' | 'PENALTY' | 'NEUTRAL';
  xpMultiplier: number;
  coinMultiplier: number;
  message: string;
  color: string;
}

// ============================================================================
// Energy System Service
// ============================================================================

export class SquadEnergyService {
  private energyStates: Map<string, SquadEnergyState> = new Map();
  private activities: Map<string, EnergyActivity[]> = new Map();

  /**
   * Check if squad energy system is enabled
   */
  static isEnabled(): boolean {
    return featureFlags.isEnabled('squad_energy_system');
  }

  /**
   * Initialize energy state for a new squad
   */
  initializeSquadEnergy(squadId: string): SquadEnergyState {
    const state: SquadEnergyState = {
      squadId,
      currentEnergy: ENERGY_CONFIG.MAX_ENERGY,
      maxEnergy: ENERGY_CONFIG.MAX_ENERGY,
      energyConsumedToday: 0,
      energyRegeneratedToday: 0,
      lastResetAt: Date.now(),
      isDormant: false,
      dormantSince: null,
      dormantWarningSent: false,
      highEnergyBonusActive: true,
      bonusMultiplier: ENERGY_CONFIG.HIGH_ENERGY_XP_MULTIPLIER,
      totalSessionsPowered: 0,
      totalChallengesCompleted: 0,
      daysSinceLastDormant: 999,
      updatedAt: Date.now(),
    };

    this.energyStates.set(squadId, state);
    this.activities.set(squadId, []);

    // Emit initialization event
    eventBus.publish('squad:energy_initialized', {
      squadId,
      initialEnergy: state.currentEnergy,
    });

    return state;
  }

  /**
   * Consume energy when a member starts a session
   */
  consumeEnergy(
    squadId: string,
    userId: string,
    activityType: 'SESSION' | 'CHALLENGE' | 'BOSS_RAID'
  ): { success: boolean; energyRemaining: number; effect: EnergyEffect } {
    const state = this.energyStates.get(squadId);
    if (!state) {
      return {
        success: false,
        energyRemaining: 0,
        effect: this.getNeutralEffect(),
      };
    }

    // Check daily reset
    this.checkDailyReset(state);

    // Calculate cost
    let cost = ENERGY_CONFIG.SESSION_START_COST;
    if (activityType === 'CHALLENGE') cost = ENERGY_CONFIG.CHALLENGE_START_COST;
    if (activityType === 'BOSS_RAID') cost = ENERGY_CONFIG.BOSS_RAID_COST;

    // Check if enough energy
    if (state.currentEnergy < cost) {
      // Not enough energy - squad is dormant or close to it
      return {
        success: false,
        energyRemaining: state.currentEnergy,
        effect: this.getDormantEffect(),
      };
    }

    // Consume energy
    state.currentEnergy -= cost;
    state.energyConsumedToday += cost;
    state.totalSessionsPowered++;
    state.updatedAt = Date.now();

    // Check thresholds
    this.updateEnergyEffects(state);

    // Record activity
    this.recordActivity(squadId, {
      id: `act_${Date.now()}_${Math.random()}`,
      squadId,
      userId,
      type: 'CONSUME',
      amount: -cost,
      reason: `Started ${activityType.toLowerCase()}`,
      timestamp: Date.now(),
    });

    // Emit event
    eventBus.publish('squad:energy_consumed', {
      squadId,
      userId,
      amount: cost,
      energyRemaining: state.currentEnergy,
      activityType,
    });

    return {
      success: true,
      energyRemaining: state.currentEnergy,
      effect: this.getCurrentEffect(state),
    };
  }

  /**
   * Regenerate energy when a member completes positive activity
   */
  regenerateEnergy(
    squadId: string,
    userId: string,
    activityType: 'SESSION_COMPLETE' | 'STREAK_MILESTONE' | 'DAILY_LOGIN'
  ): { regenerated: number; newTotal: number } {
    const state = this.energyStates.get(squadId);
    if (!state) {
      return { regenerated: 0, newTotal: 0 };
    }

    // Check daily reset
    this.checkDailyReset(state);

    // Calculate regeneration
    let regen = 0;
    if (activityType === 'SESSION_COMPLETE') {
      regen = ENERGY_CONFIG.SESSION_COMPLETE_BONUS;
    } else if (activityType === 'STREAK_MILESTONE') {
      regen = ENERGY_CONFIG.STREAK_MILESTONE_BONUS;
    } else if (activityType === 'DAILY_LOGIN') {
      regen = ENERGY_CONFIG.DAILY_REGEN;
    }

    // Apply regeneration (capped at max)
    const oldEnergy = state.currentEnergy;
    state.currentEnergy = Math.min(
      ENERGY_CONFIG.MAX_ENERGY,
      state.currentEnergy + regen
    );
    const actualRegen = state.currentEnergy - oldEnergy;

    state.energyRegeneratedToday += actualRegen;
    state.updatedAt = Date.now();

    // Check if recovering from dormant
    if (state.isDormant && state.currentEnergy >= ENERGY_CONFIG.LOW_ENERGY_THRESHOLD) {
      this.reviveFromDormant(state);
    }

    // Update effects
    this.updateEnergyEffects(state);

    // Record activity
    this.recordActivity(squadId, {
      id: `act_${Date.now()}_${Math.random()}`,
      squadId,
      userId,
      type: 'REGEN',
      amount: actualRegen,
      reason: activityType.replace(/_/g, ' ').toLowerCase(),
      timestamp: Date.now(),
    });

    // Emit event
    eventBus.publish('squad:energy_regenerated', {
      squadId,
      userId,
      amount: actualRegen,
      newTotal: state.currentEnergy,
      activityType,
    });

    return {
      regenerated: actualRegen,
      newTotal: state.currentEnergy,
    };
  }

  /**
   * Get current energy state
   */
  getEnergyState(squadId: string): SquadEnergyState | null {
    const state = this.energyStates.get(squadId);
    if (!state) return null;

    // Check daily reset
    this.checkDailyReset(state);

    return { ...state };
  }

  /**
   * Get current energy effect
   */
  getEnergyEffect(squadId: string): EnergyEffect {
    const state = this.energyStates.get(squadId);
    if (!state) return this.getNeutralEffect();
    return this.getCurrentEffect(state);
  }

  /**
   * Get energy history (recent activities)
   */
  getRecentActivities(squadId: string, limit = 10): EnergyActivity[] {
    const activities = this.activities.get(squadId) || [];
    return activities.slice(-limit).reverse();
  }

  /**
   * Check if squad can afford an activity
   */
  canAfford(squadId: string, activityType: 'SESSION' | 'CHALLENGE' | 'BOSS_RAID'): boolean {
    const state = this.energyStates.get(squadId);
    if (!state) return false;

    let cost = ENERGY_CONFIG.SESSION_START_COST;
    if (activityType === 'CHALLENGE') cost = ENERGY_CONFIG.CHALLENGE_START_COST;
    if (activityType === 'BOSS_RAID') cost = ENERGY_CONFIG.BOSS_RAID_COST;

    return state.currentEnergy >= cost;
  }

  /**
   * Private: Check and perform daily reset
   */
  private checkDailyReset(state: SquadEnergyState): void {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (now - state.lastResetAt > oneDayMs) {
      // Reset daily counters
      state.energyConsumedToday = 0;
      state.energyRegeneratedToday = 0;
      state.lastResetAt = now;

      // Apply daily regeneration
      state.currentEnergy = Math.min(
        ENERGY_CONFIG.MAX_ENERGY,
        state.currentEnergy + ENERGY_CONFIG.DAILY_REGEN
      );

      // Check dormant recovery
      if (state.isDormant) {
        this.checkDormantTimeout(state);
      }

      state.updatedAt = now;
    }
  }

  /**
   * Private: Update energy effects based on current level
   */
  private updateEnergyEffects(state: SquadEnergyState): void {
    const percent = (state.currentEnergy / ENERGY_CONFIG.MAX_ENERGY) * 100;

    // High energy bonus
    if (percent >= ENERGY_CONFIG.HIGH_ENERGY_THRESHOLD) {
      state.highEnergyBonusActive = true;
      state.bonusMultiplier = ENERGY_CONFIG.HIGH_ENERGY_XP_MULTIPLIER;
    }
    // Low energy warning
    else if (percent <= ENERGY_CONFIG.LOW_ENERGY_THRESHOLD) {
      state.highEnergyBonusActive = false;
      state.bonusMultiplier = 1;

      // Check if should go dormant
      if (state.currentEnergy <= 0 && !state.isDormant) {
        this.enterDormant(state);
      }
    }
    // Normal range
    else {
      state.highEnergyBonusActive = false;
      state.bonusMultiplier = 1;
    }
  }

  /**
   * Private: Enter dormant state
   */
  private enterDormant(state: SquadEnergyState): void {
    state.isDormant = true;
    state.dormantSince = Date.now();
    state.dormantWarningSent = false;

    eventBus.publish('squad:energy_dormant', {
      squadId: state.squadId,
      message: 'Your squad has gone dormant! Complete sessions to recharge.',
    });
  }

  /**
   * Private: Revive from dormant
   */
  private reviveFromDormant(state: SquadEnergyState): void {
    const dormantDuration = state.dormantSince
      ? (Date.now() - state.dormantSince) / (1000 * 60 * 60) // hours
      : 0;

    state.isDormant = false;
    state.dormantSince = null;
    state.daysSinceLastDormant = 0;

    eventBus.publish('squad:energy_revived', {
      squadId: state.squadId,
      dormantDurationHours: dormantDuration,
      message: 'Your squad is back online! Energy restored.',
    });
  }

  /**
   * Private: Check dormant timeout (auto-disband after 48h)
   */
  private checkDormantTimeout(state: SquadEnergyState): void {
    if (!state.dormantSince) return;

    const dormantHours = (Date.now() - state.dormantSince) / (1000 * 60 * 60);

    if (dormantHours >= ENERGY_CONFIG.DORMANT_MAX_DURATION_HOURS) {
      // Trigger squad disband (handled by squad service)
      eventBus.publish('squad:auto_disband', {
        squadId: state.squadId,
        reason: 'dormant_too_long',
        message: 'Squad disbanded due to inactivity.',
      });
    } else if (dormantHours >= 36 && !state.dormantWarningSent) {
      // Send warning at 36 hours
      state.dormantWarningSent = true;
      eventBus.publish('squad:energy_dormant_warning', {
        squadId: state.squadId,
        hoursRemaining: ENERGY_CONFIG.DORMANT_MAX_DURATION_HOURS - dormantHours,
        message: 'Warning: Squad will disband in 12 hours without activity!',
      });
    }
  }

  /**
   * Private: Record energy activity
   */
  private recordActivity(squadId: string, activity: EnergyActivity): void {
    const activities = this.activities.get(squadId) || [];
    activities.push(activity);

    // Keep only last 100 activities
    if (activities.length > 100) {
      activities.shift();
    }

    this.activities.set(squadId, activities);
  }

  /**
   * Private: Get current effect based on state
   */
  private getCurrentEffect(state: SquadEnergyState): EnergyEffect {
    const percent = (state.currentEnergy / ENERGY_CONFIG.MAX_ENERGY) * 100;

    if (state.isDormant) {
      return this.getDormantEffect();
    }

    if (percent >= ENERGY_CONFIG.HIGH_ENERGY_THRESHOLD) {
      return {
        type: 'BONUS',
        xpMultiplier: ENERGY_CONFIG.HIGH_ENERGY_XP_MULTIPLIER,
        coinMultiplier: ENERGY_CONFIG.HIGH_ENERGY_COIN_MULTIPLIER,
        message: 'High Energy Bonus Active! 🚀',
        color: '#10B981',
      };
    }

    if (percent <= ENERGY_CONFIG.LOW_ENERGY_THRESHOLD) {
      return {
        type: 'PENALTY',
        xpMultiplier: 1,
        coinMultiplier: 1,
        message: 'Low Energy Warning! Recharge soon! ⚠️',
        color: '#F59E0B',
      };
    }

    return this.getNeutralEffect();
  }

  /**
   * Private: Get dormant effect
   */
  private getDormantEffect(): EnergyEffect {
    return {
      type: 'PENALTY',
      xpMultiplier: ENERGY_CONFIG.DORMANT_XP_PENALTY,
      coinMultiplier: ENERGY_CONFIG.DORMANT_COIN_PENALTY,
      message: 'SQUAD DORMANT! Reduced rewards until recharged! 😴',
      color: '#EF4444',
    };
  }

  /**
   * Private: Get neutral effect
   */
  private getNeutralEffect(): EnergyEffect {
    return {
      type: 'NEUTRAL',
      xpMultiplier: 1,
      coinMultiplier: 1,
      message: '',
      color: '#6B7280',
    };
  }
}

// ============================================================================
// Factory & Hooks
// ============================================================================

export function createSquadEnergyService(): SquadEnergyService {
  return new SquadEnergyService();
}

// Singleton instance
let energyService: SquadEnergyService | null = null;

export function getSquadEnergyService(): SquadEnergyService {
  if (!energyService) {
    energyService = new SquadEnergyService();
  }
  return energyService;
}
