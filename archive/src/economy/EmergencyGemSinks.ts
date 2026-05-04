/**
 * Emergency Gem Sinks
 *
 * Phase 4: Economy Redesign
 * Compelling emergency purchase moments for monetization
 *
 * Users can spend gems in high-emotion moments:
 * - Streak about to break (freeze it)
 * - Boss defeat (retry for better score)
 * - Session abandoned (save partial progress)
 * - Focus shield (block boss attacks)
 *
 * These are emotional purchases - users feel urgency and loss aversion
 *
 * Dependencies:
 * - economy/CurrencyTypes-v2 (gem handling)
 * - feature-flags (gradual rollout)
 * - events (eventBus for purchase events)
 */

import { z } from 'zod';
import { featureFlags } from '../feature-flags/FeatureFlagEngine';
import { eventBus } from '../events';
import type { CurrencyTypeV2 } from './CurrencyTypes-v2';

// ============================================================================
// Emergency Sink Types & Schemas
// ============================================================================

export const EmergencySinkTypeSchema = z.enum([
  'STREAK_FREEZE',
  'BOSS_RETRY',
  'SESSION_SAVE',
  'FOCUS_SHIELD',
]);

export type EmergencySinkType = z.infer<typeof EmergencySinkTypeSchema>;

export interface EmergencySink {
  id: EmergencySinkType;
  name: string;
  description: string;
  cost: number;
  maxUsesPerDay: number;
  trigger: 'automatic' | 'manual';
  urgencyLevel: 1 | 2 | 3; // 1=low, 2=medium, 3=high (affects UI)
}

export interface EmergencyPurchaseResult {
  success: boolean;
  sinkType: EmergencySinkType;
  cost: number;
  remainingGems: number;
  usesToday: number;
  remainingUses: number;
  message: string;
  effectApplied: boolean;
}

export interface EmergencyTrigger {
  type: 'STREAK_AT_RISK' | 'BOSS_DEFEATED' | 'SESSION_ABANDONED' | 'BOSS_ATTACK_IMMIMENT';
  userId: string;
  context: Record<string, unknown>;
  urgency: 1 | 2 | 3;
  expiresAt: number; // Timestamp when offer expires
}

// ============================================================================
// Sink Configuration
// ============================================================================

export const EMERGENCY_SINKS: Record<EmergencySinkType, EmergencySink> = {
  STREAK_FREEZE: {
    id: 'STREAK_FREEZE',
    name: 'Streak Freeze',
    description: 'Prevent your streak from breaking!',
    cost: 50,
    maxUsesPerDay: 1, // Rare, high value
    trigger: 'automatic',
    urgencyLevel: 3, // Highest urgency - streak about to die
  },

  BOSS_RETRY: {
    id: 'BOSS_RETRY',
    name: 'Boss Retry',
    description: 'Try again for a better score and rewards',
    cost: 20,
    maxUsesPerDay: 3,
    trigger: 'manual',
    urgencyLevel: 2, // Medium urgency
  },

  SESSION_SAVE: {
    id: 'SESSION_SAVE',
    name: 'Session Save',
    description: 'Recover partial credit for abandoned session',
    cost: 30,
    maxUsesPerDay: 2,
    trigger: 'automatic',
    urgencyLevel: 3, // High urgency - just abandoned
  },

  FOCUS_SHIELD: {
    id: 'FOCUS_SHIELD',
    name: 'Focus Shield',
    description: 'Block the next boss attack automatically',
    cost: 15,
    maxUsesPerDay: 5,
    trigger: 'manual',
    urgencyLevel: 1, // Lowest urgency - strategic
  },
};

// ============================================================================
// Emergency Gem Sinks Service
// ============================================================================

export class EmergencyGemSinksService {
  private dailyUsage: Map<string, Map<EmergencySinkType, number>> = new Map(); // userId -> sinkType -> count
  private activeTriggers: Map<string, EmergencyTrigger[]> = new Map(); // userId -> active triggers

  /**
   * Check if emergency gem sinks are enabled
   */
  static isEnabled(): boolean {
    return featureFlags.isEnabled('emergency_gem_sinks');
  }

  /**
   * Trigger an emergency offer to the user
   */
  triggerEmergency(
    userId: string,
    triggerType: EmergencyTrigger['type'],
    context: Record<string, unknown>,
    urgency: 1 | 2 | 3 = 2
  ): EmergencySink | null {
    if (!EmergencyGemSinksService.isEnabled()) {
      return null;
    }

    let sinkType: EmergencySinkType | null = null;

    // Map trigger to sink type
    switch (triggerType) {
      case 'STREAK_AT_RISK':
        sinkType = 'STREAK_FREEZE';
        break;
      case 'BOSS_DEFEATED':
        sinkType = 'BOSS_RETRY';
        break;
      case 'SESSION_ABANDONED':
        sinkType = 'SESSION_SAVE';
        break;
      case 'BOSS_ATTACK_IMMIMENT':
        sinkType = 'FOCUS_SHIELD';
        break;
    }

    if (!sinkType) return null;

    const sink = EMERGENCY_SINKS[sinkType];

    // Check if user has uses remaining
    const usesToday = this.getDailyUsage(userId, sinkType);
    if (usesToday >= sink.maxUsesPerDay) {
      return null; // No uses left
    }

    // Create trigger
    const trigger: EmergencyTrigger = {
      type: triggerType,
      userId,
      context,
      urgency,
      expiresAt: Date.now() + (urgency === 3 ? 5 * 60 * 1000 : 10 * 60 * 1000), // 5min for high, 10min for others
    };

    // Store trigger
    const userTriggers = this.activeTriggers.get(userId) || [];
    userTriggers.push(trigger);
    this.activeTriggers.set(userId, userTriggers);

    // Emit trigger event (for UI)
    eventBus.publish('economy:emergency_triggered', {
      userId,
      sinkType,
      triggerType,
      urgency,
      expiresIn: urgency === 3 ? 300 : 600, // seconds
    });

    return sink;
  }

  /**
   * Purchase an emergency sink
   */
  purchaseEmergencySink(
    userId: string,
    sinkType: EmergencySinkType,
    currentGems: number
  ): EmergencyPurchaseResult {
    const sink = EMERGENCY_SINKS[sinkType];
    const usesToday = this.getDailyUsage(userId, sinkType);

    // Validation
    if (!EmergencyGemSinksService.isEnabled()) {
      return {
        success: false,
        sinkType,
        cost: 0,
        remainingGems: currentGems,
        usesToday,
        remainingUses: 0,
        message: 'Emergency gem sinks are not available',
        effectApplied: false,
      };
    }

    if (usesToday >= sink.maxUsesPerDay) {
      return {
        success: false,
        sinkType,
        cost: 0,
        remainingGems: currentGems,
        usesToday,
        remainingUses: 0,
        message: `Daily limit reached (${sink.maxUsesPerDay} per day)`,
        effectApplied: false,
      };
    }

    if (currentGems < sink.cost) {
      return {
        success: false,
        sinkType,
        cost: sink.cost,
        remainingGems: currentGems,
        usesToday,
        remainingUses: sink.maxUsesPerDay - usesToday,
        message: `Not enough gems. You need ${sink.cost - currentGems} more gems.`,
        effectApplied: false,
      };
    }

    // Apply purchase
    const newGems = currentGems - sink.cost;
    this.incrementDailyUsage(userId, sinkType);
    const newUsesToday = usesToday + 1;

    // Apply effect
    const effectApplied = this.applySinkEffect(sinkType, userId);

    // Clear trigger if exists
    this.clearTrigger(userId, sinkType);

    // Emit purchase event
    eventBus.publish('economy:emergency_purchased', {
      userId,
      sinkType,
      cost: sink.cost,
      remainingGems: newGems,
      usesToday: newUsesToday,
    });

    // Track analytics
    this.trackPurchase(userId, sinkType, sink.cost);

    return {
      success: true,
      sinkType,
      cost: sink.cost,
      remainingGems: newGems,
      usesToday: newUsesToday,
      remainingUses: sink.maxUsesPerDay - newUsesToday,
      message: this.getSuccessMessage(sinkType),
      effectApplied,
    };
  }

  /**
   * Get available emergency offers for a user
   */
  getAvailableOffers(userId: string): Array<{
    sink: EmergencySink;
    canAfford: boolean;
    usesRemaining: number;
    urgency: 1 | 2 | 3;
    expiresIn: number;
  }> {
    const offers: ReturnType<typeof this.getAvailableOffers> = [];

    const triggers = this.activeTriggers.get(userId) || [];

    for (const trigger of triggers) {
      const sinkType = this.getSinkTypeFromTrigger(trigger.type);
      if (!sinkType) continue;

      const sink = EMERGENCY_SINKS[sinkType];
      const usesToday = this.getDailyUsage(userId, sinkType);
      const usesRemaining = sink.maxUsesPerDay - usesToday;

      if (usesRemaining > 0) {
        offers.push({
          sink,
          canAfford: true, // Will be checked at purchase time
          usesRemaining,
          urgency: trigger.urgency,
          expiresIn: Math.max(0, trigger.expiresAt - Date.now()),
        });
      }
    }

    return offers.sort((a, b) => b.urgency - a.urgency);
  }

  /**
   * Check if user can use a specific sink
   */
  canUseSink(userId: string, sinkType: EmergencySinkType): {
    canUse: boolean;
    reason?: string;
    usesRemaining: number;
  } {
    if (!EmergencyGemSinksService.isEnabled()) {
      return { canUse: false, reason: 'Not enabled', usesRemaining: 0 };
    }

    const sink = EMERGENCY_SINKS[sinkType];
    const usesToday = this.getDailyUsage(userId, sinkType);
    const usesRemaining = sink.maxUsesPerDay - usesToday;

    if (usesRemaining <= 0) {
      return {
        canUse: false,
        reason: `Daily limit reached (${sink.maxUsesPerDay} per day)`,
        usesRemaining: 0,
      };
    }

    return { canUse: true, usesRemaining };
  }

  /**
   * Reset daily usage (call at midnight)
   */
  resetDailyUsage(): void {
    this.dailyUsage.clear();
    console.log('[EmergencyGemSinks] Daily usage reset');
  }

  /**
   * Get all sinks for display in shop
   */
  getAllSinks(): EmergencySink[] {
    return Object.values(EMERGENCY_SINKS);
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private getDailyUsage(userId: string, sinkType: EmergencySinkType): number {
    const userUsage = this.dailyUsage.get(userId);
    if (!userUsage) return 0;
    return userUsage.get(sinkType) || 0;
  }

  private incrementDailyUsage(userId: string, sinkType: EmergencySinkType): void {
    let userUsage = this.dailyUsage.get(userId);
    if (!userUsage) {
      userUsage = new Map();
      this.dailyUsage.set(userId, userUsage);
    }
    const current = userUsage.get(sinkType) || 0;
    userUsage.set(sinkType, current + 1);
  }

  private clearTrigger(userId: string, sinkType: EmergencySinkType): void {
    const triggers = this.activeTriggers.get(userId) || [];
    const triggerType = this.getTriggerTypeFromSink(sinkType);

    const filtered = triggers.filter(t => t.type !== triggerType);
    this.activeTriggers.set(userId, filtered);
  }

  private getSinkTypeFromTrigger(triggerType: EmergencyTrigger['type']): EmergencySinkType | null {
    const mapping: Record<EmergencyTrigger['type'], EmergencySinkType> = {
      'STREAK_AT_RISK': 'STREAK_FREEZE',
      'BOSS_DEFEATED': 'BOSS_RETRY',
      'SESSION_ABANDONED': 'SESSION_SAVE',
      'BOSS_ATTACK_IMMIMENT': 'FOCUS_SHIELD',
    };
    return mapping[triggerType] || null;
  }

  private getTriggerTypeFromSink(sinkType: EmergencySinkType): EmergencyTrigger['type'] | null {
    const mapping: Record<EmergencySinkType, EmergencyTrigger['type']> = {
      'STREAK_FREEZE': 'STREAK_AT_RISK',
      'BOSS_RETRY': 'BOSS_DEFEATED',
      'SESSION_SAVE': 'SESSION_ABANDONED',
      'FOCUS_SHIELD': 'BOSS_ATTACK_IMMIMENT',
    };
    return mapping[sinkType];
  }

  private applySinkEffect(sinkType: EmergencySinkType, userId: string): boolean {
    // Emit effect event - actual effect applied by other services
    switch (sinkType) {
      case 'STREAK_FREEZE':
        eventBus.publish('emergency:streak_frozen', { userId });
        return true;

      case 'BOSS_RETRY':
        eventBus.publish('emergency:boss_retry_granted', { userId });
        return true;

      case 'SESSION_SAVE':
        eventBus.publish('emergency:session_saved', { userId });
        return true;

      case 'FOCUS_SHIELD':
        eventBus.publish('emergency:focus_shield_activated', { userId });
        return true;

      default:
        return false;
    }
  }

  private getSuccessMessage(sinkType: EmergencySinkType): string {
    const messages: Record<EmergencySinkType, string> = {
      'STREAK_FREEZE': 'Streak frozen! You have 24 hours to complete a session.',
      'BOSS_RETRY': 'Boss retry granted! Go for that perfect score!',
      'SESSION_SAVE': 'Session saved! You got partial credit.',
      'FOCUS_SHIELD': 'Focus shield activated! Next attack blocked.',
    };
    return messages[sinkType];
  }

  private trackPurchase(userId: string, sinkType: EmergencySinkType, cost: number): void {
    // Analytics tracking
    console.log('[EmergencyGemSinks] Purchase tracked:', {
      userId,
      sinkType,
      cost,
      timestamp: Date.now(),
    });
  }
}

// ============================================================================
// Factory & Singleton
// ============================================================================

let emergencyService: EmergencyGemSinksService | null = null;

export function getEmergencyGemSinksService(): EmergencyGemSinksService {
  if (!emergencyService) {
    emergencyService = new EmergencyGemSinksService();
  }
  return emergencyService;
}
