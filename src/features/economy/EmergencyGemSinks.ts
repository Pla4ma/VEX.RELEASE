/**
 * Emergency Gem Sinks
 *
 * Phase 4B: Economy - Emergency gem sinks for critical situations
 *
 * Provides emergency purchases using GEMS for:
 * - Streak Freeze: Protect streak from breaking
 * - Boss Retry: Get another attempt at failed boss
 * - Session Save: Save progress in difficult session
 *
 * Creates meaningful gem usage for retention and monetization.
 *
 * Dependencies:
 * - features/economy/types (CurrencyType, Wallet)
 * - feature-flags (gradual rollout)
 * - events (eventBus for purchase tracking)
 * - streaks (streak system integration)
 * - boss (boss system integration)
 * - session (session system integration)
 */

import { z } from 'zod';
import { featureFlags } from '../../feature-flags/FeatureFlagEngine';
import { eventBus } from '../../events';
import type { CurrencyType, Wallet } from './types';

// ============================================================================
// Emergency Sink Constants
// ============================================================================

export const EMERGENCY_SINK_CONFIG = {
  // Streak Freeze
  STREAK_FREEZE: {
    cost: 50, // 50 gems
    durationHours: 24, // Protects streak for 24 hours
    maxUsesPerWeek: 2, // Anti-abuse limit
    description: 'Protect your streak from breaking for 24 hours',
  },

  // Boss Retry
  BOSS_RETRY: {
    cost: 100, // 100 gems
    maxUsesPerBoss: 3, // Max 3 retries per boss encounter
    restoreHealthPercent: 100, // Full health restore
    description: 'Get another attempt at a failed boss with full health',
  },

  // Session Save
  SESSION_SAVE: {
    cost: 25, // 25 gems
    maxSavesPerDay: 3, // Anti-abuse limit
    minSessionDuration: 15, // Minimum 15 minutes to save
    description: 'Save your current session progress and resume later',
  },

  // Global limits
  WEEKLY_GEM_LIMIT: 500, // Max 500 gems per week on emergency purchases
  COOLDOWN_HOURS: 1, // 1 hour cooldown between purchases
} as const;

// ============================================================================
// Types & Schemas
// ============================================================================

export const EmergencyPurchaseTypeSchema = z.enum([
  'STREAK_FREEZE',
  'BOSS_RETRY', 
  'SESSION_SAVE',
]);

export const EmergencyPurchaseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  purchaseType: EmergencyPurchaseTypeSchema,
  
  // Cost and payment
  currency: z.literal('GEMS'),
  cost: z.number().positive(),
  paidAt: z.number(),
  
  // Purchase details
  context: z.record(z.unknown()).optional(), // Specific context (streakId, bossId, sessionId)
  
  // Status and usage
  status: z.enum(['pending', 'active', 'used', 'expired']).default('pending'),
  activatedAt: z.number().nullable().default(null),
  expiresAt: z.number().nullable().default(null),
  
  // Limits tracking
  weeklyUseCount: z.number().default(0),
  lastUsedAt: z.number().nullable().default(null),
  
  createdAt: z.number(),
});

export const EmergencyUsageLimitsSchema = z.object({
  userId: z.string(),
  weekStartAt: z.number(),
  
  // Weekly totals
  totalGemsSpent: z.number().default(0),
  purchasesCount: z.number().default(0),
  
  // Type-specific limits
  streakFreezeUsed: z.number().default(0),
  bossRetryUsed: z.number().default(0),
  sessionSaveUsed: z.number().default(0),
  
  // Cooldown tracking
  lastPurchaseAt: z.number().nullable().default(null),
  
  updatedAt: z.number(),
});

export type EmergencyPurchaseType = z.infer<typeof EmergencyPurchaseTypeSchema>;
export type EmergencyPurchase = z.infer<typeof EmergencyPurchaseSchema>;
export type EmergencyUsageLimits = z.infer<typeof EmergencyUsageLimitsSchema>;

export interface EmergencyPurchaseResult {
  success: boolean;
  purchase?: EmergencyPurchase;
  error?: string;
  remainingBalance?: number;
  weeklyLimitRemaining?: number;
}

export interface EmergencyEffect {
  type: 'STREAK_PROTECTED' | 'BOSS_HEALTH_RESTORED' | 'SESSION_SAVED';
  duration?: number; // For time-based effects
  value?: number; // For numeric effects
  message: string;
  expiresAt?: number;
}

// ============================================================================
// Emergency Gem Sinks Service
// ============================================================================

export class EmergencyGemSinksService {
  private purchases: Map<string, EmergencyPurchase> = new Map();
  private usageLimits: Map<string, EmergencyUsageLimits> = new Map(); // userId_weekStart

  /**
   * Check if emergency gem sinks are enabled
   */
  static isEnabled(): boolean {
    return featureFlags.isEnabled('emergency_gem_sinks');
  }

  /**
   * Purchase streak freeze
   */
  async purchaseStreakFreeze(input: {
    userId: string;
    streakId?: string;
  }): Promise<EmergencyPurchaseResult> {
    // Check feature flag
    if (!EmergencyGemSinksService.isEnabled()) {
      return { success: false, error: 'Emergency gem sinks not enabled' };
    }

    // Check user balance
    const wallet = await this.getUserWallet(input.userId);
    if (wallet.gems < EMERGENCY_SINK_CONFIG.STREAK_FREEZE.cost) {
      return { success: false, error: 'Insufficient gems', remainingBalance: wallet.gems };
    }

    // Check usage limits
    const limitsCheck = await this.checkUsageLimits(input.userId, 'STREAK_FREEZE');
    if (!limitsCheck.allowed) {
      return { 
        success: false, 
        error: limitsCheck.reason,
        weeklyLimitRemaining: limitsCheck.weeklyLimitRemaining
      };
    }

    // Create purchase
    const now = Date.now();
    const purchase: EmergencyPurchase = {
      id: `emergency_${now}_${Math.random().toString(36).substr(2, 9)}`,
      userId: input.userId,
      purchaseType: 'STREAK_FREEZE',
      currency: 'GEMS',
      cost: EMERGENCY_SINK_CONFIG.STREAK_FREEZE.cost,
      paidAt: now,
      context: { streakId: input.streakId },
      status: 'pending',
      activatedAt: null,
      expiresAt: null,
      weeklyUseCount: 0,
      lastUsedAt: null,
      createdAt: now,
    };

    // Deduct gems
    await this.deductGems(input.userId, EMERGENCY_SINK_CONFIG.STREAK_FREEZE.cost);

    // Store purchase
    this.purchases.set(purchase.id, purchase);

    // Update usage limits
    await this.updateUsageLimits(input.userId, 'STREAK_FREEZE', EMERGENCY_SINK_CONFIG.STREAK_FREEZE.cost);

    // Emit event
    eventBus.publish('emergency:streak_freeze_purchased', {
      purchaseId: purchase.id,
      userId: input.userId,
      streakId: input.streakId,
      cost: EMERGENCY_SINK_CONFIG.STREAK_FREEZE.cost,
    });

    // Auto-activate streak freeze
    await this.activateStreakFreeze(purchase);

    return { 
      success: true, 
      purchase,
      remainingBalance: wallet.gems - EMERGENCY_SINK_CONFIG.STREAK_FREEZE.cost,
      weeklyLimitRemaining: limitsCheck.weeklyLimitRemaining,
    };
  }

  /**
   * Purchase boss retry
   */
  async purchaseBossRetry(input: {
    userId: string;
    bossId: string;
    encounterId?: string;
  }): Promise<EmergencyPurchaseResult> {
    // Check feature flag
    if (!EmergencyGemSinksService.isEnabled()) {
      return { success: false, error: 'Emergency gem sinks not enabled' };
    }

    // Check user balance
    const wallet = await this.getUserWallet(input.userId);
    if (wallet.gems < EMERGENCY_SINK_CONFIG.BOSS_RETRY.cost) {
      return { success: false, error: 'Insufficient gems', remainingBalance: wallet.gems };
    }

    // Check usage limits
    const limitsCheck = await this.checkUsageLimits(input.userId, 'BOSS_RETRY');
    if (!limitsCheck.allowed) {
      return { 
        success: false, 
        error: limitsCheck.reason,
        weeklyLimitRemaining: limitsCheck.weeklyLimitRemaining
      };
    }

    // Check boss-specific retry limit
    const bossRetriesUsed = await this.getBossRetryCount(input.userId, input.bossId);
    if (bossRetriesUsed >= EMERGENCY_SINK_CONFIG.BOSS_RETRY.maxUsesPerBoss) {
      return { success: false, error: 'Maximum retries reached for this boss' };
    }

    // Create purchase
    const now = Date.now();
    const purchase: EmergencyPurchase = {
      id: `emergency_${now}_${Math.random().toString(36).substr(2, 9)}`,
      userId: input.userId,
      purchaseType: 'BOSS_RETRY',
      currency: 'GEMS',
      cost: EMERGENCY_SINK_CONFIG.BOSS_RETRY.cost,
      paidAt: now,
      context: { bossId: input.bossId, encounterId: input.encounterId },
      status: 'pending',
      activatedAt: null,
      expiresAt: null,
      weeklyUseCount: 0,
      lastUsedAt: null,
      createdAt: now,
    };

    // Deduct gems
    await this.deductGems(input.userId, EMERGENCY_SINK_CONFIG.BOSS_RETRY.cost);

    // Store purchase
    this.purchases.set(purchase.id, purchase);

    // Update usage limits
    await this.updateUsageLimits(input.userId, 'BOSS_RETRY', EMERGENCY_SINK_CONFIG.BOSS_RETRY.cost);

    // Emit event
    eventBus.publish('emergency:boss_retry_purchased', {
      purchaseId: purchase.id,
      userId: input.userId,
      bossId: input.bossId,
      encounterId: input.encounterId,
      cost: EMERGENCY_SINK_CONFIG.BOSS_RETRY.cost,
    });

    // Auto-activate boss retry
    await this.activateBossRetry(purchase);

    return { 
      success: true, 
      purchase,
      remainingBalance: wallet.gems - EMERGENCY_SINK_CONFIG.BOSS_RETRY.cost,
      weeklyLimitRemaining: limitsCheck.weeklyLimitRemaining,
    };
  }

  /**
   * Purchase session save
   */
  async purchaseSessionSave(input: {
    userId: string;
    sessionId: string;
    sessionDuration: number; // minutes
  }): Promise<EmergencyPurchaseResult> {
    // Check feature flag
    if (!EmergencyGemSinksService.isEnabled()) {
      return { success: false, error: 'Emergency gem sinks not enabled' };
    }

    // Check minimum session duration
    if (input.sessionDuration < EMERGENCY_SINK_CONFIG.SESSION_SAVE.minSessionDuration) {
      return { success: false, error: `Session must be at least ${EMERGENCY_SINK_CONFIG.SESSION_SAVE.minSessionDuration} minutes` };
    }

    // Check user balance
    const wallet = await this.getUserWallet(input.userId);
    if (wallet.gems < EMERGENCY_SINK_CONFIG.SESSION_SAVE.cost) {
      return { success: false, error: 'Insufficient gems', remainingBalance: wallet.gems };
    }

    // Check usage limits
    const limitsCheck = await this.checkUsageLimits(input.userId, 'SESSION_SAVE');
    if (!limitsCheck.allowed) {
      return { 
        success: false, 
        error: limitsCheck.reason,
        weeklyLimitRemaining: limitsCheck.weeklyLimitRemaining
      };
    }

    // Create purchase
    const now = Date.now();
    const purchase: EmergencyPurchase = {
      id: `emergency_${now}_${Math.random().toString(36).substr(2, 9)}`,
      userId: input.userId,
      purchaseType: 'SESSION_SAVE',
      currency: 'GEMS',
      cost: EMERGENCY_SINK_CONFIG.SESSION_SAVE.cost,
      paidAt: now,
      context: { sessionId: input.sessionId, sessionDuration: input.sessionDuration },
      status: 'pending',
      activatedAt: null,
      expiresAt: null,
      weeklyUseCount: 0,
      lastUsedAt: null,
      createdAt: now,
    };

    // Deduct gems
    await this.deductGems(input.userId, EMERGENCY_SINK_CONFIG.SESSION_SAVE.cost);

    // Store purchase
    this.purchases.set(purchase.id, purchase);

    // Update usage limits
    await this.updateUsageLimits(input.userId, 'SESSION_SAVE', EMERGENCY_SINK_CONFIG.SESSION_SAVE.cost);

    // Emit event
    eventBus.publish('emergency:session_save_purchased', {
      purchaseId: purchase.id,
      userId: input.userId,
      sessionId: input.sessionId,
      sessionDuration: input.sessionDuration,
      cost: EMERGENCY_SINK_CONFIG.SESSION_SAVE.cost,
    });

    // Auto-activate session save
    await this.activateSessionSave(purchase);

    return { 
      success: true, 
      purchase,
      remainingBalance: wallet.gems - EMERGENCY_SINK_CONFIG.SESSION_SAVE.cost,
      weeklyLimitRemaining: limitsCheck.weeklyLimitRemaining,
    };
  }

  /**
   * Get user's emergency purchase history
   */
  getUserEmergencyPurchases(userId: string, limit = 50): EmergencyPurchase[] {
    const userPurchases = Array.from(this.purchases.values())
      .filter(p => p.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);

    return userPurchases;
  }

  /**
   * Get user's current usage limits
   */
  getUserUsageLimits(userId: string): EmergencyUsageLimits {
    const weekStart = this.getWeekStart(Date.now());
    const limitsKey = `${userId}_${weekStart}`;
    
    let limits = this.usageLimits.get(limitsKey);
    if (!limits) {
      limits = {
        userId,
        weekStartAt: weekStart,
        totalGemsSpent: 0,
        purchasesCount: 0,
        streakFreezeUsed: 0,
        bossRetryUsed: 0,
        sessionSaveUsed: 0,
        lastPurchaseAt: null,
        updatedAt: Date.now(),
      };
      this.usageLimits.set(limitsKey, limits);
    }

    return { ...limits };
  }

  /**
   * Check if user can make emergency purchase
   */
  canMakePurchase(userId: string, purchaseType: EmergencyPurchaseType): {
    allowed: boolean;
    reason?: string;
    weeklyLimitRemaining?: number;
    cooldownRemaining?: number;
  } {
    const limits = this.getUserUsageLimits(userId);
    const now = Date.now();

    // Check weekly gem limit
    if (limits.totalGemsSpent >= EMERGENCY_SINK_CONFIG.WEEKLY_GEM_LIMIT) {
      return {
        allowed: false,
        reason: 'Weekly gem limit reached',
        weeklyLimitRemaining: 0,
      };
    }

    // Check cooldown
    if (limits.lastPurchaseAt) {
      const cooldownRemaining = EMERGENCY_SINK_CONFIG.COOLDOWN_HOURS * 60 * 60 * 1000 - (now - limits.lastPurchaseAt);
      if (cooldownRemaining > 0) {
        return {
          allowed: false,
          reason: 'Cooldown period active',
          cooldownRemaining: Math.ceil(cooldownRemaining / (1000 * 60)), // minutes
        };
      }
    }

    // Check type-specific limits
    switch (purchaseType) {
      case 'STREAK_FREEZE':
        if (limits.streakFreezeUsed >= EMERGENCY_SINK_CONFIG.STREAK_FREEZE.maxUsesPerWeek) {
          return {
            allowed: false,
            reason: 'Weekly streak freeze limit reached',
          };
        }
        break;
      case 'BOSS_RETRY':
        // Boss-specific limit checked in purchase method
        break;
      case 'SESSION_SAVE':
        if (limits.sessionSaveUsed >= EMERGENCY_SINK_CONFIG.SESSION_SAVE.maxSavesPerDay) {
          return {
            allowed: false,
            reason: 'Daily session save limit reached',
          };
        }
        break;
    }

    return {
      allowed: true,
      weeklyLimitRemaining: EMERGENCY_SINK_CONFIG.WEEKLY_GEM_LIMIT - limits.totalGemsSpent,
    };
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Get user wallet (would integrate with wallet service)
   */
  private async getUserWallet(userId: string): Promise<Wallet> {
    // This would integrate with the existing wallet service
    // For now, return a mock wallet
    return {
      id: `wallet_${userId}`,
      userId,
      coins: 1000,
      gems: 500,
      focusPoints: 100,
      totalCoinsEarned: 5000,
      totalCoinsSpent: 4000,
      totalGemsEarned: 1000,
      totalGemsSpent: 500,
      createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now(),
    };
  }

  /**
   * Deduct gems from user wallet
   */
  private async deductGems(userId: string, amount: number): Promise<void> {
    // This would integrate with the existing wallet service
    // For now, just emit an event
    eventBus.publish('economy:currency_spent', {
      userId,
      currency: 'GEMS' as CurrencyType,
      amount,
      source: 'EMERGENCY_PURCHASE',
    });
  }

  /**
   * Check usage limits for a purchase type
   */
  private async checkUsageLimits(userId: string, purchaseType: EmergencyPurchaseType): Promise<{
    allowed: boolean;
    reason?: string;
    weeklyLimitRemaining: number;
  }> {
    const limits = this.getUserUsageLimits(userId);
    const canPurchase = this.canMakePurchase(userId, purchaseType);
    
    return {
      allowed: canPurchase.allowed,
      reason: canPurchase.reason,
      weeklyLimitRemaining: canPurchase.weeklyLimitRemaining || 0,
    };
  }

  /**
   * Update usage limits after purchase
   */
  private async updateUsageLimits(userId: string, purchaseType: EmergencyPurchaseType, cost: number): Promise<void> {
    const weekStart = this.getWeekStart(Date.now());
    const limitsKey = `${userId}_${weekStart}`;
    
    let limits = this.usageLimits.get(limitsKey);
    if (!limits) {
      limits = this.getUserUsageLimits(userId);
    }

    limits.totalGemsSpent += cost;
    limits.purchasesCount += 1;
    limits.lastPurchaseAt = Date.now();
    limits.updatedAt = Date.now();

    switch (purchaseType) {
      case 'STREAK_FREEZE':
        limits.streakFreezeUsed += 1;
        break;
      case 'BOSS_RETRY':
        limits.bossRetryUsed += 1;
        break;
      case 'SESSION_SAVE':
        limits.sessionSaveUsed += 1;
        break;
    }

    this.usageLimits.set(limitsKey, limits);
  }

  /**
   * Get boss retry count for user
   */
  private async getBossRetryCount(userId: string, bossId: string): Promise<number> {
    const userPurchases = this.getUserEmergencyPurchases(userId);
    return userPurchases.filter(p => 
      p.purchaseType === 'BOSS_RETRY' && 
      p.context?.bossId === bossId &&
      p.status === 'used'
    ).length;
  }

  /**
   * Get week start timestamp
   */
  private getWeekStart(timestamp: number): number {
    const date = new Date(timestamp);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(date.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.getTime();
  }

  /**
   * Activate streak freeze effect
   */
  private async activateStreakFreeze(purchase: EmergencyPurchase): Promise<void> {
    const now = Date.now();
    purchase.status = 'active';
    purchase.activatedAt = now;
    purchase.expiresAt = now + (EMERGENCY_SINK_CONFIG.STREAK_FREEZE.durationHours * 60 * 60 * 1000);
    
    this.purchases.set(purchase.id, purchase);

    // Emit streak protection event
    eventBus.publish('streak:freeze_activated', {
      userId: purchase.userId,
      purchaseId: purchase.id,
      streakId: purchase.context?.streakId,
      expiresAt: purchase.expiresAt,
      durationHours: EMERGENCY_SINK_CONFIG.STREAK_FREEZE.durationHours,
    });

    // Notify user
    eventBus.publish('notification:send', {
      userId: purchase.userId,
      type: 'STREAK_FREEZE_ACTIVATED',
      title: 'Streak Freeze Activated! ❄️',
      body: `Your streak is protected for ${EMERGENCY_SINK_CONFIG.STREAK_FREEZE.durationHours} hours`,
      data: {
        purchaseId: purchase.id,
        expiresAt: purchase.expiresAt,
      },
    });
  }

  /**
   * Activate boss retry effect
   */
  private async activateBossRetry(purchase: EmergencyPurchase): Promise<void> {
    const now = Date.now();
    purchase.status = 'used';
    purchase.activatedAt = now;
    
    this.purchases.set(purchase.id, purchase);

    // Emit boss retry event
    eventBus.publish('boss:retry_activated', {
      userId: purchase.userId,
      purchaseId: purchase.id,
      bossId: purchase.context?.bossId,
      encounterId: purchase.context?.encounterId,
      healthRestorePercent: EMERGENCY_SINK_CONFIG.BOSS_RETRY.restoreHealthPercent,
    });

    // Notify user
    eventBus.publish('notification:send', {
      userId: purchase.userId,
      type: 'BOSS_RETRY_ACTIVATED',
      title: 'Boss Retry Ready! ⚔️',
      body: 'Boss health restored. Try again!',
      data: {
        purchaseId: purchase.id,
        bossId: purchase.context?.bossId,
      },
    });
  }

  /**
   * Activate session save effect
   */
  private async activateSessionSave(purchase: EmergencyPurchase): Promise<void> {
    const now = Date.now();
    purchase.status = 'active';
    purchase.activatedAt = now;
    // Session saves don't expire - they're one-time use
    
    this.purchases.set(purchase.id, purchase);

    // Emit session save event
    eventBus.publish('session:save_activated', {
      userId: purchase.userId,
      purchaseId: purchase.id,
      sessionId: purchase.context?.sessionId,
      sessionDuration: purchase.context?.sessionDuration,
    });

    // Notify user
    eventBus.publish('notification:send', {
      userId: purchase.userId,
      type: 'SESSION_SAVE_ACTIVATED',
      title: 'Session Saved! 💾',
      body: 'Your session progress has been saved. Resume anytime!',
      data: {
        purchaseId: purchase.id,
        sessionId: purchase.context?.sessionId,
      },
    });
  }
}

// ============================================================================
// Factory & Exports
// ============================================================================

export function createEmergencyGemSinksService(): EmergencyGemSinksService {
  return new EmergencyGemSinksService();
}

// Singleton instance
let emergencyGemSinksService: EmergencyGemSinksService | null = null;

export function getEmergencyGemSinksService(): EmergencyGemSinksService {
  if (!emergencyGemSinksService) {
    emergencyGemSinksService = new EmergencyGemSinksService();
  }
  return emergencyGemSinksService;
}
