/**
 * Session V2 Events
 * 
 * Event definitions and EventBus integration for session-v2.
 * Centralizes all combat-related events and their schemas.
 */

import { z } from 'zod';
import { eventBus } from '../../events';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('session:v2:events');

// ============================================================================
// Event Schemas
// ============================================================================

export const SessionV2EventSchemas = {
  // Session Lifecycle Events
  SESSION_STARTED: z.object({
    sessionId: z.string(),
    userId: z.string(),
    phase: z.string(),
    bossId: z.string().optional(),
    timestamp: z.number(),
  }),

  SESSION_COMPLETED: z.object({
    sessionId: z.string(),
    userId: z.string(),
    duration: z.number(),
    completionPercentage: z.number(),
    totalDamage: z.number(),
    abilitiesUsed: z.number(),
    bossDefeated: z.boolean(),
    timestamp: z.number(),
  }),

  SESSION_PAUSED: z.object({
    sessionId: z.string(),
    userId: z.string(),
    phase: z.string(),
    elapsedTime: z.number(),
    timestamp: z.number(),
  }),

  SESSION_RESUMED: z.object({
    sessionId: z.string(),
    userId: z.string(),
    phase: z.string(),
    elapsedTime: z.number(),
    backgroundTime: z.number(),
    timestamp: z.number(),
  }),

  // Combat Events
  COMBAT_ABILITY_USED: z.object({
    sessionId: z.string(),
    userId: z.string(),
    abilityId: z.string(),
    abilityName: z.string(),
    abilityType: z.string(),
    damage: z.number(),
    energyCost: z.number(),
    comboCount: z.number(),
    timestamp: z.number(),
  }),

  COMBAT_DODGE_ATTEMPTED: z.object({
    sessionId: z.string(),
    userId: z.string(),
    attackType: z.string(),
    dodgeSuccessRate: z.number(),
    comboCount: z.number(),
    timestamp: z.number(),
  }),

  COMBAT_DODGE_SUCCESS: z.object({
    sessionId: z.string(),
    userId: z.string(),
    attackType: z.string(),
    dodgeWindow: z.number(),
    reactionTime: z.number(),
    comboCount: z.number(),
    timestamp: z.number(),
  }),

  COMBO_ACHIEVED: z.object({
    sessionId: z.string(),
    userId: z.string(),
    comboCount: z.number(),
    comboMultiplier: z.number(),
    totalDamage: z.number(),
    timestamp: z.number(),
  }),

  // Boss Events
  BOSS_PHASE_CHANGED: z.object({
    sessionId: z.string(),
    userId: z.string(),
    bossId: z.string(),
    oldPhase: z.string(),
    newPhase: z.string(),
    bossHealthPercent: z.number(),
    timestamp: z.number(),
  }),

  BOSS_DEFEATED: z.object({
    sessionId: z.string(),
    userId: z.string(),
    bossId: z.string(),
    bossTier: z.string(),
    totalDamage: z.number(),
    timeToDefeat: z.number(),
    abilitiesUsed: z.number(),
    timestamp: z.number(),
  }),

  // Progression Events
  XP_GRANTED: z.object({
    sessionId: z.string(),
    userId: z.string(),
    xpAmount: z.number(),
    source: z.string(),
    breakdown: z.object({
      baseXP: z.number(),
      completionXP: z.number(),
      combatXP: z.number(),
      comboXP: z.number(),
      dodgeXP: z.number(),
    }),
    timestamp: z.number(),
  }),

  LEVEL_UP: z.object({
    sessionId: z.string(),
    userId: z.string(),
    newLevel: z.number(),
    xpEarned: z.number(),
    abilitiesUnlocked: z.array(z.string()),
    timestamp: z.number(),
  }),

  ACHIEVEMENT_UNLOCKED: z.object({
    sessionId: z.string(),
    userId: z.string(),
    achievementId: z.string(),
    achievementName: z.string(),
    reward: z.object({
      xp: z.number().optional(),
      coins: z.number().optional(),
      gems: z.number().optional(),
    }),
    timestamp: z.number(),
  }),

  // Economy Events
  REWARDS_GRANTED: z.object({
    sessionId: z.string(),
    userId: z.string(),
    rewards: z.object({
      coins: z.number(),
      gems: z.number(),
      seasonalCurrency: z.number(),
      items: z.array(z.object({
        id: z.string(),
        name: z.string(),
        quantity: z.number(),
        rarity: z.string(),
      })),
    }),
    multiplier: z.number(),
    timestamp: z.number(),
  }),

  TRANSACTION_COMPLETED: z.object({
    sessionId: z.string(),
    userId: z.string(),
    transactionId: z.string(),
    type: z.string(),
    amount: z.number(),
    currency: z.string(),
    balance: z.number(),
    timestamp: z.number(),
  }),

  // Analytics Events
  PERFORMANCE_METRICS: z.object({
    sessionId: z.string(),
    userId: z.string(),
    metrics: z.object({
      frameRate: z.number(),
      memoryUsage: z.number(),
      renderTime: z.number(),
      updateTime: z.number(),
    }),
    timestamp: z.number(),
  }),

  USER_BEHAVIOR: z.object({
    sessionId: z.string(),
    userId: z.string(),
    action: z.string(),
    context: z.record(z.any()),
    timestamp: z.number(),
  }),

  // Error Events
  ERROR_OCCURRED: z.object({
    sessionId: z.string(),
    userId: z.string(),
    errorType: z.string(),
    errorMessage: z.string(),
    stackTrace: z.string().optional(),
    context: z.record(z.any()),
    timestamp: z.number(),
  }),

  RECOVERY_ATTEMPTED: z.object({
    sessionId: z.string(),
    userId: z.string(),
    recoveryType: z.string(),
    success: z.boolean(),
    timestamp: z.number(),
  }),
};

// ============================================================================
// Event Types
// ============================================================================

export type SessionV2Event = {
  SESSION_STARTED: z.infer<typeof SessionV2EventSchemas.SESSION_STARTED>;
  SESSION_COMPLETED: z.infer<typeof SessionV2EventSchemas.SESSION_COMPLETED>;
  SESSION_PAUSED: z.infer<typeof SessionV2EventSchemas.SESSION_PAUSED>;
  SESSION_RESUMED: z.infer<typeof SessionV2EventSchemas.SESSION_RESUMED>;
  COMBAT_ABILITY_USED: z.infer<typeof SessionV2EventSchemas.COMBAT_ABILITY_USED>;
  COMBAT_DODGE_ATTEMPTED: z.infer<typeof SessionV2EventSchemas.COMBAT_DODGE_ATTEMPTED>;
  COMBAT_DODGE_SUCCESS: z.infer<typeof SessionV2EventSchemas.COMBAT_DODGE_SUCCESS>;
  COMBO_ACHIEVED: z.infer<typeof SessionV2EventSchemas.COMBO_ACHIEVED>;
  BOSS_PHASE_CHANGED: z.infer<typeof SessionV2EventSchemas.BOSS_PHASE_CHANGED>;
  BOSS_DEFEATED: z.infer<typeof SessionV2EventSchemas.BOSS_DEFEATED>;
  XP_GRANTED: z.infer<typeof SessionV2EventSchemas.XP_GRANTED>;
  LEVEL_UP: z.infer<typeof SessionV2EventSchemas.LEVEL_UP>;
  ACHIEVEMENT_UNLOCKED: z.infer<typeof SessionV2EventSchemas.ACHIEVEMENT_UNLOCKED>;
  REWARDS_GRANTED: z.infer<typeof SessionV2EventSchemas.REWARDS_GRANTED>;
  TRANSACTION_COMPLETED: z.infer<typeof SessionV2EventSchemas.TRANSACTION_COMPLETED>;
  PERFORMANCE_METRICS: z.infer<typeof SessionV2EventSchemas.PERFORMANCE_METRICS>;
  USER_BEHAVIOR: z.infer<typeof SessionV2EventSchemas.USER_BEHAVIOR>;
  ERROR_OCCURRED: z.infer<typeof SessionV2EventSchemas.ERROR_OCCURRED>;
  RECOVERY_ATTEMPTED: z.infer<typeof SessionV2EventSchemas.RECOVERY_ATTEMPTED>;
};

// ============================================================================
// Event Publisher
// ============================================================================

export class SessionV2EventPublisher {
  private static instance: SessionV2EventPublisher;

  static getInstance(): SessionV2EventPublisher {
    if (!SessionV2EventPublisher.instance) {
      SessionV2EventPublisher.instance = new SessionV2EventPublisher();
    }
    return SessionV2EventPublisher.instance;
  }

  // ============================================================================
  // Session Lifecycle Events
  // ============================================================================

  publishSessionStarted(data: z.infer<typeof SessionV2EventSchemas.SESSION_STARTED>): void {
    try {
      SessionV2EventSchemas.SESSION_STARTED.parse(data);
      eventBus.publish('session:v2:started', data);
      debug.info('Session started event published', { sessionId: data.sessionId });
    } catch (error) {
      debug.error('Failed to publish session started event', error);
    }
  }

  publishSessionCompleted(data: z.infer<typeof SessionV2EventSchemas.SESSION_COMPLETED>): void {
    try {
      SessionV2EventSchemas.SESSION_COMPLETED.parse(data);
      eventBus.publish('session:v2:completed', data);
      debug.info('Session completed event published', { sessionId: data.sessionId });
    } catch (error) {
      debug.error('Failed to publish session completed event', error);
    }
  }

  publishSessionPaused(data: z.infer<typeof SessionV2EventSchemas.SESSION_PAUSED>): void {
    try {
      SessionV2EventSchemas.SESSION_PAUSED.parse(data);
      eventBus.publish('session:v2:paused', data);
      debug.info('Session paused event published', { sessionId: data.sessionId });
    } catch (error) {
      debug.error('Failed to publish session paused event', error);
    }
  }

  publishSessionResumed(data: z.infer<typeof SessionV2EventSchemas.SESSION_RESUMED>): void {
    try {
      SessionV2EventSchemas.SESSION_RESUMED.parse(data);
      eventBus.publish('session:v2:resumed', data);
      debug.info('Session resumed event published', { sessionId: data.sessionId });
    } catch (error) {
      debug.error('Failed to publish session resumed event', error);
    }
  }

  // ============================================================================
  // Combat Events
  // ============================================================================

  publishAbilityUsed(data: z.infer<typeof SessionV2EventSchemas.COMBAT_ABILITY_USED>): void {
    try {
      SessionV2EventSchemas.COMBAT_ABILITY_USED.parse(data);
      eventBus.publish('session:v2:ability_used', data);
      debug.info('Ability used event published', { abilityId: data.abilityId });
    } catch (error) {
      debug.error('Failed to publish ability used event', error);
    }
  }

  publishDodgeAttempted(data: z.infer<typeof SessionV2EventSchemas.COMBAT_DODGE_ATTEMPTED>): void {
    try {
      SessionV2EventSchemas.COMBAT_DODGE_ATTEMPTED.parse(data);
      eventBus.publish('session:v2:dodge_attempted', data);
      debug.info('Dodge attempted event published', { attackType: data.attackType });
    } catch (error) {
      debug.error('Failed to publish dodge attempted event', error);
    }
  }

  publishDodgeSuccess(data: z.infer<typeof SessionV2EventSchemas.COMBAT_DODGE_SUCCESS>): void {
    try {
      SessionV2EventSchemas.COMBAT_DODGE_SUCCESS.parse(data);
      eventBus.publish('session:v2:dodge_success', data);
      debug.info('Dodge success event published', { attackType: data.attackType });
    } catch (error) {
      debug.error('Failed to publish dodge success event', error);
    }
  }

  publishComboAchieved(data: z.infer<typeof SessionV2EventSchemas.COMBO_ACHIEVED>): void {
    try {
      SessionV2EventSchemas.COMBO_ACHIEVED.parse(data);
      eventBus.publish('session:v2:combo_achieved', data);
      debug.info('Combo achieved event published', { comboCount: data.comboCount });
    } catch (error) {
      debug.error('Failed to publish combo achieved event', error);
    }
  }

  // ============================================================================
  // Boss Events
  // ============================================================================

  publishBossPhaseChanged(data: z.infer<typeof SessionV2EventSchemas.BOSS_PHASE_CHANGED>): void {
    try {
      SessionV2EventSchemas.BOSS_PHASE_CHANGED.parse(data);
      eventBus.publish('session:v2:boss_phase_changed', data);
      debug.info('Boss phase changed event published', { 
        bossId: data.bossId, 
        newPhase: data.newPhase 
      });
    } catch (error) {
      debug.error('Failed to publish boss phase changed event', error);
    }
  }

  publishBossDefeated(data: z.infer<typeof SessionV2EventSchemas.BOSS_DEFEATED>): void {
    try {
      SessionV2EventSchemas.BOSS_DEFEATED.parse(data);
      eventBus.publish('session:v2:boss_defeated', data);
      debug.info('Boss defeated event published', { bossId: data.bossId });
    } catch (error) {
      debug.error('Failed to publish boss defeated event', error);
    }
  }

  // ============================================================================
  // Progression Events
  // ============================================================================

  publishXPGranted(data: z.infer<typeof SessionV2EventSchemas.XP_GRANTED>): void {
    try {
      SessionV2EventSchemas.XP_GRANTED.parse(data);
      eventBus.publish('session:v2:xp_granted', data);
      debug.info('XP granted event published', { xpAmount: data.xpAmount });
    } catch (error) {
      debug.error('Failed to publish XP granted event', error);
    }
  }

  publishLevelUp(data: z.infer<typeof SessionV2EventSchemas.LEVEL_UP>): void {
    try {
      SessionV2EventSchemas.LEVEL_UP.parse(data);
      eventBus.publish('session:v2:level_up', data);
      debug.info('Level up event published', { newLevel: data.newLevel });
    } catch (error) {
      debug.error('Failed to publish level up event', error);
    }
  }

  publishAchievementUnlocked(data: z.infer<typeof SessionV2EventSchemas.ACHIEVEMENT_UNLOCKED>): void {
    try {
      SessionV2EventSchemas.ACHIEVEMENT_UNLOCKED.parse(data);
      eventBus.publish('session:v2:achievement_unlocked', data);
      debug.info('Achievement unlocked event published', { achievementId: data.achievementId });
    } catch (error) {
      debug.error('Failed to publish achievement unlocked event', error);
    }
  }

  // ============================================================================
  // Economy Events
  // ============================================================================

  publishRewardsGranted(data: z.infer<typeof SessionV2EventSchemas.REWARDS_GRANTED>): void {
    try {
      SessionV2EventSchemas.REWARDS_GRANTED.parse(data);
      eventBus.publish('session:v2:rewards_granted', data);
      debug.info('Rewards granted event published', { coins: data.rewards.coins });
    } catch (error) {
      debug.error('Failed to publish rewards granted event', error);
    }
  }

  publishTransactionCompleted(data: z.infer<typeof SessionV2EventSchemas.TRANSACTION_COMPLETED>): void {
    try {
      SessionV2EventSchemas.TRANSACTION_COMPLETED.parse(data);
      eventBus.publish('session:v2:transaction_completed', data);
      debug.info('Transaction completed event published', { transactionId: data.transactionId });
    } catch (error) {
      debug.error('Failed to publish transaction completed event', error);
    }
  }

  // ============================================================================
  // Analytics Events
  // ============================================================================

  publishPerformanceMetrics(data: z.infer<typeof SessionV2EventSchemas.PERFORMANCE_METRICS>): void {
    try {
      SessionV2EventSchemas.PERFORMANCE_METRICS.parse(data);
      eventBus.publish('session:v2:performance_metrics', data);
      debug.info('Performance metrics event published', { sessionId: data.sessionId });
    } catch (error) {
      debug.error('Failed to publish performance metrics event', error);
    }
  }

  publishUserBehavior(data: z.infer<typeof SessionV2EventSchemas.USER_BEHAVIOR>): void {
    try {
      SessionV2EventSchemas.USER_BEHAVIOR.parse(data);
      eventBus.publish('session:v2:user_behavior', data);
      debug.info('User behavior event published', { action: data.action });
    } catch (error) {
      debug.error('Failed to publish user behavior event', error);
    }
  }

  // ============================================================================
  // Error Events
  // ============================================================================

  publishErrorOccurred(data: z.infer<typeof SessionV2EventSchemas.ERROR_OCCURRED>): void {
    try {
      SessionV2EventSchemas.ERROR_OCCURRED.parse(data);
      eventBus.publish('session:v2:error_occurred', data);
      debug.error('Error occurred event published', { errorType: data.errorType });
    } catch (error) {
      debug.error('Failed to publish error occurred event', error);
    }
  }

  publishRecoveryAttempted(data: z.infer<typeof SessionV2EventSchemas.RECOVERY_ATTEMPTED>): void {
    try {
      SessionV2EventSchemas.RECOVERY_ATTEMPTED.parse(data);
      eventBus.publish('session:v2:recovery_attempted', data);
      debug.info('Recovery attempted event published', { recoveryType: data.recoveryType });
    } catch (error) {
      debug.error('Failed to publish recovery attempted event', error);
    }
  }
}

// ============================================================================
// Event Subscriber
// ============================================================================

export class SessionV2EventSubscriber {
  private static instance: SessionV2EventSubscriber;
  private subscriptions: Map<string, () => void> = new Map();

  static getInstance(): SessionV2EventSubscriber {
    if (!SessionV2EventSubscriber.instance) {
      SessionV2EventSubscriber.instance = new SessionV2EventSubscriber();
    }
    return SessionV2EventSubscriber.instance;
  }

  // ============================================================================
  // Session Lifecycle Subscriptions
  // ============================================================================

  subscribeToSessionStarted(callback: (data: z.infer<typeof SessionV2EventSchemas.SESSION_STARTED>) => void): void {
    const unsubscribe = eventBus.subscribe('session:v2:started', callback);
    this.subscriptions.set('session:v2:started', unsubscribe);
  }

  subscribeToSessionCompleted(callback: (data: z.infer<typeof SessionV2EventSchemas.SESSION_COMPLETED>) => void): void {
    const unsubscribe = eventBus.subscribe('session:v2:completed', callback);
    this.subscriptions.set('session:v2:completed', unsubscribe);
  }

  subscribeToSessionPaused(callback: (data: z.infer<typeof SessionV2EventSchemas.SESSION_PAUSED>) => void): void {
    const unsubscribe = eventBus.subscribe('session:v2:paused', callback);
    this.subscriptions.set('session:v2:paused', unsubscribe);
  }

  subscribeToSessionResumed(callback: (data: z.infer<typeof SessionV2EventSchemas.SESSION_RESUMED>) => void): void {
    const unsubscribe = eventBus.subscribe('session:v2:resumed', callback);
    this.subscriptions.set('session:v2:resumed', unsubscribe);
  }

  // ============================================================================
  // Combat Subscriptions
  // ============================================================================

  subscribeToAbilityUsed(callback: (data: z.infer<typeof SessionV2EventSchemas.COMBAT_ABILITY_USED>) => void): void {
    const unsubscribe = eventBus.subscribe('session:v2:ability_used', callback);
    this.subscriptions.set('session:v2:ability_used', unsubscribe);
  }

  subscribeToDodgeAttempted(callback: (data: z.infer<typeof SessionV2EventSchemas.COMBAT_DODGE_ATTEMPTED>) => void): void {
    const unsubscribe = eventBus.subscribe('session:v2:dodge_attempted', callback);
    this.subscriptions.set('session:v2:dodge_attempted', unsubscribe);
  }

  subscribeToDodgeSuccess(callback: (data: z.infer<typeof SessionV2EventSchemas.COMBAT_DODGE_SUCCESS>) => void): void {
    const unsubscribe = eventBus.subscribe('session:v2:dodge_success', callback);
    this.subscriptions.set('session:v2:dodge_success', unsubscribe);
  }

  subscribeToComboAchieved(callback: (data: z.infer<typeof SessionV2EventSchemas.COMBO_ACHIEVED>) => void): void {
    const unsubscribe = eventBus.subscribe('session:v2:combo_achieved', callback);
    this.subscriptions.set('session:v2:combo_achieved', unsubscribe);
  }

  // ============================================================================
  // Boss Subscriptions
  // ============================================================================

  subscribeToBossPhaseChanged(callback: (data: z.infer<typeof SessionV2EventSchemas.BOSS_PHASE_CHANGED>) => void): void {
    const unsubscribe = eventBus.subscribe('session:v2:boss_phase_changed', callback);
    this.subscriptions.set('session:v2:boss_phase_changed', unsubscribe);
  }

  subscribeToBossDefeated(callback: (data: z.infer<typeof SessionV2EventSchemas.BOSS_DEFEATED>) => void): void {
    const unsubscribe = eventBus.subscribe('session:v2:boss_defeated', callback);
    this.subscriptions.set('session:v2:boss_defeated', unsubscribe);
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  unsubscribeAll(): void {
    for (const [event, unsubscribe] of this.subscriptions) {
      unsubscribe();
      debug.info('Unsubscribed from event', { event });
    }
    this.subscriptions.clear();
  }

  unsubscribe(event: string): void {
    const unsubscribe = this.subscriptions.get(event);
    if (unsubscribe) {
      unsubscribe();
      this.subscriptions.delete(event);
      debug.info('Unsubscribed from event', { event });
    }
  }
}

// ============================================================================
// Exports
// ============================================================================

export const sessionV2Events = SessionV2EventPublisher.getInstance();
export const sessionV2Subscriber = SessionV2EventSubscriber.getInstance();

export default {
  publisher: sessionV2Events,
  subscriber: sessionV2Subscriber,
  schemas: SessionV2EventSchemas,
};
