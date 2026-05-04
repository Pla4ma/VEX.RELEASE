/**
 * Trading System
 *
 * Phase 4C: Economy - Item trading between users
 *
 * Enables users to trade items with each other creating a player-driven economy.
 * Features include:
 * - Trade requests and negotiations
 * - Item valuation and fairness checks
 * - Trade history and reputation
 * - Anti-scam and fraud protection
 *
 * Dependencies:
 * - features/economy/types (CurrencyType, Wallet)
 * - features/inventory (item management)
 * - feature-flags (gradual rollout)
 * - events (eventBus for trade notifications)
 * - notifications (trade alerts)
 */

import { z } from 'zod';
import { featureFlags } from '../../feature-flags/FeatureFlagEngine';
import { eventBus } from '../../events';
import type { CurrencyType } from './types';

// ============================================================================
// Trading System Constants
// ============================================================================

export const TRADING_CONFIG = {
  // Trade limits
  MAX_TRADE_ITEMS: 10,           // Max items per trade
  MAX_TRADE_VALUE: 10000,        // Max total value per trade (in coins equivalent)
  MIN_REPUTATION_FOR_TRADING: 10, // Min reputation to initiate trades
  
  // Time limits
  TRADE_REQUEST_DURATION_HOURS: 48,  // Trade requests expire after 48 hours
  RESPONSE_TIMEOUT_HOURS: 24,         // Must respond within 24 hours
  
  // Fees and taxes
  TRADE_FEE_PERCENTAGE: 0.05,    // 5% trading fee
  TRADE_FEE_MIN: 10,             // Minimum 10 coins fee
  
  // Reputation system
  REP_GAIN_SUCCESSFUL_TRADE: 5,  // +5 rep for successful trades
  REP_LOST_FAILED_TRADE: 2,      // -2 rep for cancelled trades
  REP_LOST_SCAM_PENALTY: 50,     // -50 rep for confirmed scams
  
  // Anti-scam protection
  MAX_TRADES_PER_DAY: 10,        // Max trades per user per day
  SUSPICIOUS_PATTERN_THRESHOLD: 3, // Flag suspicious behavior after 3 similar trades
  
  // Item categories with trade restrictions
  RESTRICTED_CATEGORIES: ['PREMIUM', 'LIMITED_EDITION', 'EVENT_EXCLUSIVE'],
  BANNED_CATEGORIES: ['ADMIN_ONLY', 'DEBUG', 'TEST'],
} as const;

// ============================================================================
// Types & Schemas
// ============================================================================

export const TradeItemSchema = z.object({
  itemId: z.string(),
  quantity: z.number().positive(),
  category: z.string(),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']),
  estimatedValue: z.number().positive(), // In coins equivalent
  isTradable: z.boolean(),
  restrictions: z.array(z.string()).default([]),
});

export const TradeOfferSchema = z.object({
  id: z.string(),
  initiatorId: z.string(),
  recipientId: z.string(),
  
  // Trade contents
  offeredItems: z.array(TradeItemSchema),
  requestedItems: z.array(TradeItemSchema),
  offeredCurrency: z.record(z.number()).default({}), // currency -> amount
  requestedCurrency: z.record(z.number()).default({}),
  
  // Status
  status: z.enum(['pending', 'accepted', 'rejected', 'cancelled', 'expired', 'disputed']).default('pending'),
  
  // Timing
  createdAt: z.number(),
  expiresAt: z.number(),
  respondedAt: z.number().nullable().default(null),
  completedAt: z.number().nullable().default(null),
  
  // Value and fairness
  offeredValue: z.number(), // Total value offered
  requestedValue: z.number(), // Total value requested
  fairnessScore: z.number().min(-1).max(1), // -1 (very unfair) to 1 (very generous)
  
  // Messages
  initiatorMessage: z.string().max(500).default(''),
  recipientMessage: z.string().max(500).default(''),
  
  // Dispute handling
  disputeReason: z.string().nullable().default(null),
  disputeResolvedAt: z.number().nullable().default(null),
  disputeResolution: z.enum(['favor_initiator', 'favor_recipient', 'cancel_trade']).nullable().default(null),
  
  // Metadata
  metadata: z.record(z.unknown()).default({}),
});

export const TradeReputationSchema = z.object({
  userId: z.string(),
  
  // Reputation scores
  overallReputation: z.number().default(0),
  tradeSuccessRate: z.number().default(0), // 0-1 percentage
  totalTrades: z.number().default(0),
  successfulTrades: z.number().default(0),
  
  // Recent activity
  tradesLast30Days: z.number().default(0),
  averageTradeValue: z.number().default(0),
  lastTradeAt: z.number().nullable().default(null),
  
  // Trust indicators
  isTrustedTrader: z.boolean().default(false),
  scamReports: z.number().default(0),
  disputesInitiated: z.number().default(0),
  disputesLost: z.number().default(0),
  
  // Restrictions
  tradingRestricted: z.boolean().default(false),
  restrictionReason: z.string().nullable().default(null),
  restrictionExpiresAt: z.number().nullable().default(null),
  
  updatedAt: z.number(),
});

export const TradeHistorySchema = z.object({
  id: z.string(),
  userId: z.string(),
  tradeId: z.string(),
  role: z.enum(['initiator', 'recipient']),
  
  // Trade details
  partnerId: z.string(),
  itemsGiven: z.array(TradeItemSchema),
  itemsReceived: z.array(TradeItemSchema),
  currencyGiven: z.record(z.number()).default({}),
  currencyReceived: z.record(z.number()).default({}),
  
  // Outcome
  status: z.enum(['completed', 'cancelled', 'disputed']),
  completedAt: z.number(),
  
  // Value tracking
  totalValueGiven: z.number(),
  totalValueReceived: z.number(),
  profitLoss: z.number(), // Positive = profit, negative = loss
  
  // Feedback
  leftFeedback: z.boolean().default(false),
  receivedFeedback: z.boolean().default(false),
  partnerRating: z.number().min(1).max(5).nullable().default(null),
});

export type TradeItem = z.infer<typeof TradeItemSchema>;
export type TradeOffer = z.infer<typeof TradeOfferSchema>;
export type TradeReputation = z.infer<typeof TradeReputationSchema>;
export type TradeHistory = z.infer<typeof TradeHistorySchema>;

export interface TradeRequest {
  initiatorId: string;
  recipientId: string;
  offeredItems: TradeItem[];
  requestedItems: TradeItem[];
  offeredCurrency?: Record<CurrencyType, number>;
  requestedCurrency?: Record<CurrencyType, number>;
  message?: string;
}

export interface TradeResponse {
  action: 'accept' | 'reject' | 'counter';
  message?: string;
  counterOffer?: Partial<TradeRequest>;
}

export interface TradeValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  fairnessScore: number;
  totalValueOffered: number;
  totalValueRequested: number;
}

// ============================================================================
// Trading System Service
// ============================================================================

export class TradingSystemService {
  private tradeOffers: Map<string, TradeOffer> = new Map();
  private tradeReputations: Map<string, TradeReputation> = new Map();
  private tradeHistory: Map<string, TradeHistory[]> = new Map(); // userId -> history
  private activeTradesPerUser: Map<string, number> = new Map(); // userId -> count
  private dailyTradeCounts: Map<string, number> = new Map(); // userId_date -> count

  /**
   * Check if trading system is enabled
   */
  static isEnabled(): boolean {
    return featureFlags.isEnabled('trading_system');
  }

  /**
   * Create a new trade offer
   */
  async createTradeOffer(request: TradeRequest): Promise<{ success: boolean; tradeId?: string; error?: string }> {
    // Check feature flag
    if (!TradingSystemService.isEnabled()) {
      return { success: false, error: 'Trading system not enabled' };
    }

    // Validate users can trade
    const initiatorCanTrade = await this.canUserTrade(request.initiatorId);
    if (!initiatorCanTrade.allowed) {
      return { success: false, error: initiatorCanTrade.reason };
    }

    const recipientCanTrade = await this.canUserTrade(request.recipientId);
    if (!recipientCanTrade.allowed) {
      return { success: false, error: `Recipient cannot trade: ${recipientCanTrade.reason}` };
    }

    // Validate trade
    const validation = await this.validateTradeRequest(request);
    if (!validation.valid) {
      return { success: false, error: validation.errors.join('; ') };
    }

    // Check daily limits
    const dailyLimitCheck = this.checkDailyLimits(request.initiatorId);
    if (!dailyLimitCheck.allowed) {
      return { success: false, error: dailyLimitCheck.reason };
    }

    // Create trade offer
    const now = Date.now();
    const tradeId = `trade_${now}_${Math.random().toString(36).substr(2, 9)}`;
    
    const tradeOffer: TradeOffer = {
      id: tradeId,
      initiatorId: request.initiatorId,
      recipientId: request.recipientId,
      offeredItems: request.offeredItems,
      requestedItems: request.requestedItems,
      offeredCurrency: request.offeredCurrency || {},
      requestedCurrency: request.requestedCurrency || {},
      status: 'pending',
      createdAt: now,
      expiresAt: now + (TRADING_CONFIG.TRADE_REQUEST_DURATION_HOURS * 60 * 60 * 1000),
      respondedAt: null,
      completedAt: null,
      offeredValue: validation.totalValueOffered,
      requestedValue: validation.totalValueRequested,
      fairnessScore: validation.fairnessScore,
      initiatorMessage: request.message || '',
      recipientMessage: '',
      disputeReason: null,
      disputeResolvedAt: null,
      disputeResolution: null,
      metadata: {},
    };

    // Store trade offer
    this.tradeOffers.set(tradeId, tradeOffer);

    // Update daily counts
    this.updateDailyTradeCount(request.initiatorId);

    // Emit event
    eventBus.publish('trade:offer_created', {
      tradeId,
      initiatorId: request.initiatorId,
      recipientId: request.recipientId,
      offeredValue: validation.totalValueOffered,
      requestedValue: validation.totalValueRequested,
      fairnessScore: validation.fairnessScore,
    });

    // Notify recipient
    await this.notifyTradeOffer(tradeOffer);

    return { success: true, tradeId };
  }

  /**
   * Respond to a trade offer
   */
  async respondToTradeOffer(tradeId: string, userId: string, response: TradeResponse): Promise<{ success: boolean; error?: string }> {
    const trade = this.tradeOffers.get(tradeId);
    if (!trade) {
      return { success: false, error: 'Trade not found' };
    }

    // Verify user is recipient
    if (trade.recipientId !== userId) {
      return { success: false, error: 'Only recipient can respond to trade' };
    }

    // Check if trade is still pending
    if (trade.status !== 'pending') {
      return { success: false, error: `Trade already ${trade.status}` };
    }

    // Check if expired
    if (Date.now() > trade.expiresAt) {
      trade.status = 'expired';
      this.tradeOffers.set(tradeId, trade);
      return { success: false, error: 'Trade expired' };
    }

    const now = Date.now();
    trade.respondedAt = now;
    trade.recipientMessage = response.message || '';

    switch (response.action) {
      case 'accept':
        return await this.acceptTrade(trade, response.message);
      
      case 'reject':
        return await this.rejectTrade(trade, response.message);
      
      case 'counter':
        return await this.counterTrade(trade, response.counterOffer);
      
      default:
        return { success: false, error: 'Invalid response action' };
    }
  }

  /**
   * Accept a trade offer
   */
  private async acceptTrade(trade: TradeOffer, message?: string): Promise<{ success: boolean; error?: string }> {
    // Verify recipient has the requested items/currency
    const hasItems = await this.verifyUserHasItems(trade.recipientId, trade.requestedItems, trade.requestedCurrency);
    if (!hasItems) {
      return { success: false, error: 'Recipient does not have requested items/currency' };
    }

    // Verify initiator still has the offered items/currency
    const hasOfferedItems = await this.verifyUserHasItems(trade.initiatorId, trade.offeredItems, trade.offeredCurrency);
    if (!hasOfferedItems) {
      return { success: false, error: 'Initiator no longer has offered items/currency' };
    }

    const now = Date.now();
    trade.status = 'accepted';
    trade.completedAt = now;

    // Execute the trade
    await this.executeTrade(trade);

    // Update reputations
    await this.updateTradeReputation(trade.initiatorId, 'successful');
    await this.updateTradeReputation(trade.recipientId, 'successful');

    // Add to trade history
    await this.addToTradeHistory(trade);

    // Emit events
    eventBus.publish('trade:completed', {
      tradeId: trade.id,
      initiatorId: trade.initiatorId,
      recipientId: trade.recipientId,
      completedAt: now,
    });

    // Notify both parties
    await this.notifyTradeCompleted(trade);

    return { success: true };
  }

  /**
   * Reject a trade offer
   */
  private async rejectTrade(trade: TradeOffer, message?: string): Promise<{ success: boolean; error?: string }> {
    trade.status = 'rejected';

    // Update reputations (small penalty for rejecting)
    await this.updateTradeReputation(trade.recipientId, 'rejected');

    // Emit event
    eventBus.publish('trade:rejected', {
      tradeId: trade.id,
      initiatorId: trade.initiatorId,
      recipientId: trade.recipientId,
      reason: message,
    });

    // Notify initiator
    eventBus.publish('notification:send', {
      userId: trade.initiatorId,
      type: 'TRADE_REJECTED',
      title: 'Trade Rejected',
      body: `${trade.recipientId} rejected your trade offer`,
      data: { tradeId: trade.id },
    });

    return { success: true };
  }

  /**
   * Counter a trade offer
   */
  private async counterTrade(trade: TradeOffer, counterOffer?: Partial<TradeRequest>): Promise<{ success: boolean; error?: string }> {
    if (!counterOffer) {
      return { success: false, error: 'Counter offer details required' };
    }

    // Create new trade offer with reversed roles
    const newRequest: TradeRequest = {
      initiatorId: trade.recipientId,
      recipientId: trade.initiatorId,
      offeredItems: counterOffer.offeredItems || [],
      requestedItems: counterOffer.requestedItems || [],
      offeredCurrency: counterOffer.offeredCurrency,
      requestedCurrency: counterOffer.requestedCurrency,
      message: counterOffer.message || `Counter offer for trade ${trade.id}`,
    };

    // Validate counter offer
    const validation = await this.validateTradeRequest(newRequest);
    if (!validation.valid) {
      return { success: false, error: `Invalid counter offer: ${validation.errors.join('; ')}` };
    }

    // Mark original trade as countered
    trade.status = 'rejected';
    trade.recipientMessage = 'Counter-offer sent';

    // Create new trade
    const result = await this.createTradeOffer(newRequest);
    
    if (result.success) {
      // Notify original initiator about counter offer
      eventBus.publish('notification:send', {
        userId: trade.initiatorId,
        type: 'TRADE_COUNTERED',
        title: 'Trade Counter-Offer',
        body: `${trade.recipientId} sent a counter-offer`,
        data: { originalTradeId: trade.id, newTradeId: result.tradeId },
      });
    }

    return result;
  }

  /**
   * Get user's active trade offers
   */
  getUserTradeOffers(userId: string): { initiated: TradeOffer[]; received: TradeOffer[] } {
    const userTrades = Array.from(this.tradeOffers.values())
      .filter(trade => trade.status === 'pending' || trade.status === 'active')
      .filter(trade => trade.initiatorId === userId || trade.recipientId === userId);

    const initiated = userTrades.filter(trade => trade.initiatorId === userId);
    const received = userTrades.filter(trade => trade.recipientId === userId);

    return { initiated, received };
  }

  /**
   * Get user's trade history
   */
  getUserTradeHistory(userId: string, limit = 50): TradeHistory[] {
    const history = this.tradeHistory.get(userId) || [];
    return history
      .sort((a, b) => b.completedAt - a.completedAt)
      .slice(0, limit);
  }

  /**
   * Get user's trading reputation
   */
  getUserReputation(userId: string): TradeReputation {
    let reputation = this.tradeReputations.get(userId);
    
    if (!reputation) {
      reputation = {
        userId,
        overallReputation: 0,
        tradeSuccessRate: 0,
        totalTrades: 0,
        successfulTrades: 0,
        tradesLast30Days: 0,
        averageTradeValue: 0,
        lastTradeAt: null,
        isTrustedTrader: false,
        scamReports: 0,
        disputesInitiated: 0,
        disputesLost: 0,
        tradingRestricted: false,
        restrictionReason: null,
        restrictionExpiresAt: null,
        updatedAt: Date.now(),
      };
      this.tradeReputations.set(userId, reputation);
    }

    return { ...reputation };
  }

  /**
   * Cancel a trade offer
   */
  async cancelTradeOffer(tradeId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    const trade = this.tradeOffers.get(tradeId);
    if (!trade) {
      return { success: false, error: 'Trade not found' };
    }

    // Only initiator can cancel
    if (trade.initiatorId !== userId) {
      return { success: false, error: 'Only initiator can cancel trade' };
    }

    // Can only cancel pending trades
    if (trade.status !== 'pending') {
      return { success: false, error: `Cannot cancel trade in ${trade.status} status` };
    }

    trade.status = 'cancelled';

    // Small reputation penalty for cancelling
    await this.updateTradeReputation(userId, 'cancelled');

    // Notify recipient
    eventBus.publish('notification:send', {
      userId: trade.recipientId,
      type: 'TRADE_CANCELLED',
      title: 'Trade Cancelled',
      body: `${trade.initiatorId} cancelled the trade offer`,
      data: { tradeId: trade.id },
    });

    return { success: true };
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Check if user can trade
   */
  private async canUserTrade(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const reputation = this.getUserReputation(userId);

    // Check if restricted
    if (reputation.tradingRestricted) {
      if (reputation.restrictionExpiresAt && Date.now() < reputation.restrictionExpiresAt) {
        return { allowed: false, reason: reputation.restrictionReason || 'Trading restricted' };
      } else {
        // Restriction expired, lift it
        reputation.tradingRestricted = false;
        reputation.restrictionReason = null;
        reputation.restrictionExpiresAt = null;
        this.tradeReputations.set(userId, reputation);
      }
    }

    // Check minimum reputation
    if (reputation.overallReputation < TRADING_CONFIG.MIN_REPUTATION_FOR_TRADING) {
      return { allowed: false, reason: `Insufficient reputation (need ${TRADING_CONFIG.MIN_REPUTATION_FOR_TRADING})` };
    }

    return { allowed: true };
  }

  /**
   * Validate trade request
   */
  private async validateTradeRequest(request: TradeRequest): Promise<TradeValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check item limits
    if (request.offeredItems.length > TRADING_CONFIG.MAX_TRADE_ITEMS) {
      errors.push(`Too many items offered (max ${TRADING_CONFIG.MAX_TRADE_ITEMS})`);
    }

    if (request.requestedItems.length > TRADING_CONFIG.MAX_TRADE_ITEMS) {
      errors.push(`Too many items requested (max ${TRADING_CONFIG.MAX_TRADE_ITEMS})`);
    }

    // Check for banned categories
    const allItems = [...request.offeredItems, ...request.requestedItems];
    for (const item of allItems) {
      if (TRADING_CONFIG.BANNED_CATEGORIES.includes(item.category)) {
        errors.push(`Item ${item.itemId} is in banned category ${item.category}`);
      }
    }

    // Check trade value
    const offeredValue = await this.calculateTradeValue(request.offeredItems, request.offeredCurrency);
    const requestedValue = await this.calculateTradeValue(request.requestedItems, request.requestedCurrency);

    if (offeredValue > TRADING_CONFIG.MAX_TRADE_VALUE) {
      errors.push(`Offered value too high (max ${TRADING_CONFIG.MAX_TRADE_VALUE})`);
    }

    if (requestedValue > TRADING_CONFIG.MAX_TRADE_VALUE) {
      errors.push(`Requested value too high (max ${TRADING_CONFIG.MAX_TRADE_VALUE})`);
    }

    // Calculate fairness score
    const fairnessScore = this.calculateFairnessScore(offeredValue, requestedValue);

    // Add warnings for unfair trades
    if (fairnessScore < -0.3) {
      warnings.push('This trade appears very unfair to the initiator');
    } else if (fairnessScore > 0.3) {
      warnings.push('This trade appears very generous from the initiator');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      fairnessScore,
      totalValueOffered: offeredValue,
      totalValueRequested: requestedValue,
    };
  }

  /**
   * Calculate total trade value
   */
  private async calculateTradeValue(items: TradeItem[], currency: Record<string, number> = {}): Promise<number> {
    let totalValue = 0;

    // Add item values
    for (const item of items) {
      totalValue += item.estimatedValue * item.quantity;
    }

    // Add currency values (convert to coin equivalent)
    for (const [currencyType, amount] of Object.entries(currency)) {
      const conversionRate = await this.getCurrencyConversionRate(currencyType as CurrencyType);
      totalValue += amount * conversionRate;
    }

    return totalValue;
  }

  /**
   * Calculate fairness score (-1 to 1)
   */
  private calculateFairnessScore(offeredValue: number, requestedValue: number): number {
    if (offeredValue === 0 && requestedValue === 0) return 0;
    if (offeredValue === requestedValue) return 0;

    const ratio = offeredValue / requestedValue;
    
    // Convert to -1 to 1 scale
    // ratio < 1 = initiator getting less (negative score)
    // ratio > 1 = initiator getting more (positive score)
    if (ratio <= 0.5) return -1;
    if (ratio >= 2) return 1;
    
    // Linear interpolation between 0.5 and 2
    return (ratio - 1) / 1;
  }

  /**
   * Check daily trade limits
   */
  private checkDailyLimits(userId: string): { allowed: boolean; reason?: string } {
    const today = new Date().toDateString();
    const key = `${userId}_${today}`;
    const count = this.dailyTradeCounts.get(key) || 0;

    if (count >= TRADING_CONFIG.MAX_TRADES_PER_DAY) {
      return { allowed: false, reason: `Daily trade limit reached (${TRADING_CONFIG.MAX_TRADES_PER_DAY})` };
    }

    return { allowed: true };
  }

  /**
   * Update daily trade count
   */
  private updateDailyTradeCount(userId: string): void {
    const today = new Date().toDateString();
    const key = `${userId}_${today}`;
    const current = this.dailyTradeCounts.get(key) || 0;
    this.dailyTradeCounts.set(key, current + 1);
  }

  /**
   * Verify user has items and currency
   */
  private async verifyUserHasItems(userId: string, items: TradeItem[], currency: Record<string, number>): Promise<boolean> {
    // This would integrate with inventory and wallet services
    // For now, assume verification passes
    return true;
  }

  /**
   * Get currency conversion rate to coins
   */
  private async getCurrencyConversionRate(currencyType: CurrencyType): Promise<number> {
    // This would integrate with the currency conversion service
    // For now, use fixed rates
    switch (currencyType) {
      case 'COINS': return 1;
      case 'GEMS': return 100; // 1 gem = 100 coins
      case 'FOCUS_POINTS': return 10; // 1 focus point = 10 coins
      default: return 1;
    }
  }

  /**
   * Execute the trade (transfer items and currency)
   */
  private async executeTrade(trade: TradeOffer): Promise<void> {
    // This would integrate with inventory and wallet services
    // For now, just emit events
    
    // Transfer items from initiator to recipient
    for (const item of trade.offeredItems) {
      eventBus.publish('inventory:item_transferred', {
        fromUserId: trade.initiatorId,
        toUserId: trade.recipientId,
        itemId: item.itemId,
        quantity: item.quantity,
      });
    }

    // Transfer items from recipient to initiator
    for (const item of trade.requestedItems) {
      eventBus.publish('inventory:item_transferred', {
        fromUserId: trade.recipientId,
        toUserId: trade.initiatorId,
        itemId: item.itemId,
        quantity: item.quantity,
      });
    }

    // Transfer currency
    for (const [currencyType, amount] of Object.entries(trade.offeredCurrency)) {
      eventBus.publish('economy:currency_transferred', {
        fromUserId: trade.initiatorId,
        toUserId: trade.recipientId,
        currency: currencyType as CurrencyType,
        amount,
      });
    }

    for (const [currencyType, amount] of Object.entries(trade.requestedCurrency)) {
      eventBus.publish('economy:currency_transferred', {
        fromUserId: trade.recipientId,
        toUserId: trade.initiatorId,
        currency: currencyType as CurrencyType,
        amount,
      });
    }

    // Apply trading fee
    const totalValue = trade.offeredValue + trade.requestedValue;
    const fee = Math.max(TRADING_CONFIG.TRADE_FEE_MIN, totalValue * TRADING_CONFIG.TRADE_FEE_PERCENTAGE);
    
    if (fee > 0) {
      eventBus.publish('economy:trading_fee_applied', {
        tradeId: trade.id,
        feeAmount: fee,
        feeCurrency: 'COINS',
      });
    }
  }

  /**
   * Update user's trading reputation
   */
  private async updateTradeReputation(userId: string, outcome: 'successful' | 'rejected' | 'cancelled' | 'disputed'): Promise<void> {
    let reputation = this.tradeReputations.get(userId);
    if (!reputation) {
      reputation = this.getUserReputation(userId);
    }

    reputation.totalTrades += 1;
    reputation.lastTradeAt = Date.now();

    switch (outcome) {
      case 'successful':
        reputation.successfulTrades += 1;
        reputation.overallReputation += TRADING_CONFIG.REP_GAIN_SUCCESSFUL_TRADE;
        break;
      case 'rejected':
      case 'cancelled':
        reputation.overallReputation -= TRADING_CONFIG.REP_LOST_FAILED_TRADE;
        break;
      case 'disputed':
        reputation.disputesInitiated += 1;
        break;
    }

    // Calculate success rate
    reputation.tradeSuccessRate = reputation.totalTrades > 0 
      ? reputation.successfulTrades / reputation.totalTrades 
      : 0;

    // Update trusted status
    reputation.isTrustedTrader = reputation.overallReputation >= 50 && reputation.tradeSuccessRate >= 0.9;

    reputation.updatedAt = Date.now();
    this.tradeReputations.set(userId, reputation);
  }

  /**
   * Add trade to user history
   */
  private async addToTradeHistory(trade: TradeOffer): Promise<void> {
    const now = Date.now();

    // Add to initiator's history
    const initiatorHistory: TradeHistory = {
      id: `hist_${trade.id}_initiator`,
      userId: trade.initiatorId,
      tradeId: trade.id,
      role: 'initiator',
      partnerId: trade.recipientId,
      itemsGiven: trade.offeredItems,
      itemsReceived: trade.requestedItems,
      currencyGiven: trade.offeredCurrency,
      currencyReceived: trade.requestedCurrency,
      status: 'completed',
      completedAt: now,
      totalValueGiven: trade.offeredValue,
      totalValueReceived: trade.requestedValue,
      profitLoss: trade.requestedValue - trade.offeredValue,
      leftFeedback: false,
      receivedFeedback: false,
      partnerRating: null,
    };

    // Add to recipient's history
    const recipientHistory: TradeHistory = {
      id: `hist_${trade.id}_recipient`,
      userId: trade.recipientId,
      tradeId: trade.id,
      role: 'recipient',
      partnerId: trade.initiatorId,
      itemsGiven: trade.requestedItems,
      itemsReceived: trade.offeredItems,
      currencyGiven: trade.requestedCurrency,
      currencyReceived: trade.offeredCurrency,
      status: 'completed',
      completedAt: now,
      totalValueGiven: trade.requestedValue,
      totalValueReceived: trade.offeredValue,
      profitLoss: trade.offeredValue - trade.requestedValue,
      leftFeedback: false,
      receivedFeedback: false,
      partnerRating: null,
    };

    // Store histories
    const initiatorHist = this.tradeHistory.get(trade.initiatorId) || [];
    const recipientHist = this.tradeHistory.get(trade.recipientId) || [];
    
    initiatorHist.push(initiatorHistory);
    recipientHist.push(recipientHistory);
    
    this.tradeHistory.set(trade.initiatorId, initiatorHist);
    this.tradeHistory.set(trade.recipientId, recipientHist);
  }

  /**
   * Notify about new trade offer
   */
  private async notifyTradeOffer(trade: TradeOffer): Promise<void> {
    eventBus.publish('notification:send', {
      userId: trade.recipientId,
      type: 'TRADE_OFFER_RECEIVED',
      title: 'New Trade Offer! 🤝',
      body: `${trade.initiatorId} wants to trade with you`,
      data: {
        tradeId: trade.id,
        initiatorId: trade.initiatorId,
        offeredValue: trade.offeredValue,
        requestedValue: trade.requestedValue,
        fairnessScore: trade.fairnessScore,
        expiresAt: trade.expiresAt,
      },
    });
  }

  /**
   * Notify about completed trade
   */
  private async notifyTradeCompleted(trade: TradeOffer): Promise<void> {
    // Notify initiator
    eventBus.publish('notification:send', {
      userId: trade.initiatorId,
      type: 'TRADE_COMPLETED',
      title: 'Trade Completed! ✅',
      body: `Trade with ${trade.recipientId} completed successfully`,
      data: {
        tradeId: trade.id,
        partnerId: trade.recipientId,
        itemsReceived: trade.requestedItems,
        currencyReceived: trade.requestedCurrency,
      },
    });

    // Notify recipient
    eventBus.publish('notification:send', {
      userId: trade.recipientId,
      type: 'TRADE_COMPLETED',
      title: 'Trade Completed! ✅',
      body: `Trade with ${trade.initiatorId} completed successfully`,
      data: {
        tradeId: trade.id,
        partnerId: trade.initiatorId,
        itemsReceived: trade.offeredItems,
        currencyReceived: trade.offeredCurrency,
      },
    });
  }
}

// ============================================================================
// Factory & Exports
// ============================================================================

export function createTradingSystemService(): TradingSystemService {
  return new TradingSystemService();
}

// Singleton instance
let tradingSystemService: TradingSystemService | null = null;

export function getTradingSystemService(): TradingSystemService {
  if (!tradingSystemService) {
    tradingSystemService = new TradingSystemService();
  }
  return tradingSystemService;
}
