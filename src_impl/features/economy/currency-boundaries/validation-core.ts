/**
 * Currency Boundaries Validation Core
 *
 * Phase 6.03 - Currency And Monetization Boundaries
 * Core validation logic for currency boundaries
 * Separated from main validation service to comply with file size limits
 *
 * Dependencies:
 * - Economy (wallet operations, transaction tracking)
 * - Monetization (premium tier validation)
 * - Analytics (violation tracking, Sentry reporting)
 */

import * as Sentry from '@sentry/react-native';

import { eventBus } from '../../../events';
import type {
  TransactionValidationRequest,
  TransactionValidationResult,
  BoundaryViolation,
  BoundaryViolationType,
  CurrencyLimits,
  MonetizationBoundary,
  EconomyProtectionRule,
} from './schemas';
import { DEFAULT_CURRENCY_LIMITS, DEFAULT_MONETIZATION_BOUNDARIES, DEFAULT_PROTECTION_RULES } from './config';

// ============================================================================
// Validation Core
// ============================================================================

class CurrencyBoundariesValidationCore {
  private currencyLimits: Record<string, CurrencyLimits> = DEFAULT_CURRENCY_LIMITS;
  private monetizationBoundaries: MonetizationBoundary[] = DEFAULT_MONETIZATION_BOUNDARIES;
  private protectionRules: EconomyProtectionRule[] = DEFAULT_PROTECTION_RULES;

  /**
   * Check daily earnings limit
   */
  async checkDailyEarningsLimit(
    request: TransactionValidationRequest,
    limits: CurrencyLimits
  ): Promise<BoundaryViolation | null> {
    if (request.action !== 'EARN') {return null;}

    // In a real implementation, this would query the database
    // For now, we'll simulate the check
    const todayEarnings = await this.getTodayEarnings(request.userId, request.currency);
    const dailyLimit = request.isPremiumUser ? limits.maxDailyEarningsPremium : limits.maxDailyEarnings;

    if (todayEarnings + request.amount > dailyLimit) {
      return {
        id: crypto.randomUUID(),
        userId: request.userId,
        type: 'DAILY_EARNING_EXCEEDED',
        currency: request.currency,
        attemptedAmount: request.amount,
        attemptedAction: request.action,
        limitAmount: dailyLimit,
        limitType: 'DAILY',
        source: request.source,
        sourceId: request.sourceId,
        metadata: request.metadata,
        action: 'BLOCKED',
        warningMessage: `Daily earnings limit of ${dailyLimit} ${request.currency} exceeded`,
        createdAt: Date.now(),
      };
    }

    return null;
  }

  /**
   * Check wallet cap
   */
  async checkWalletCap(
    request: TransactionValidationRequest,
    limits: CurrencyLimits
  ): Promise<BoundaryViolation | null> {
    if (request.action !== 'EARN') {return null;}

    // In a real implementation, this would query the wallet
    // For now, we'll simulate the check
    const currentBalance = await this.getCurrentBalance(request.userId, request.currency);
    const walletCap = request.isPremiumUser ? limits.maxWalletBalancePremium : limits.maxWalletBalance;

    if (currentBalance + request.amount > walletCap) {
      return {
        id: crypto.randomUUID(),
        userId: request.userId,
        type: 'WALLET_CAP_EXCEEDED',
        currency: request.currency,
        attemptedAmount: request.amount,
        attemptedAction: request.action,
        limitAmount: walletCap,
        limitType: 'WALLET',
        source: request.source,
        sourceId: request.sourceId,
        metadata: request.metadata,
        action: 'BLOCKED',
        warningMessage: `Wallet cap of ${walletCap} ${request.currency} exceeded`,
        createdAt: Date.now(),
      };
    }

    return null;
  }

  /**
   * Check single transaction limit
   */
  async checkSingleTransactionLimit(
    request: TransactionValidationRequest,
    limits: CurrencyLimits
  ): Promise<BoundaryViolation | null> {
    if (request.action !== 'EARN') {return null;}

    const singleLimit = limits.maxSingleEarn;

    if (request.amount > singleLimit) {
      return {
        id: crypto.randomUUID(),
        userId: request.userId,
        type: 'SINGLE_TRANSACTION_LIMIT_EXCEEDED',
        currency: request.currency,
        attemptedAmount: request.amount,
        attemptedAction: request.action,
        limitAmount: singleLimit,
        limitType: 'SINGLE',
        source: request.source,
        sourceId: request.sourceId,
        metadata: request.metadata,
        action: 'BLOCKED',
        warningMessage: `Single transaction limit of ${singleLimit} ${request.currency} exceeded`,
        createdAt: Date.now(),
      };
    }

    return null;
  }

  /**
   * Check transaction velocity
   */
  async checkTransactionVelocity(
    request: TransactionValidationRequest
  ): Promise<BoundaryViolation | null> {
    // In a real implementation, this would check recent transaction count
    // For now, we'll simulate the check
    const recentTransactions = await this.getRecentTransactionCount(request.userId, 3600); // 1 hour
    const limits = this.currencyLimits[request.currency];

    if (recentTransactions >= limits.maxTransactionsPerHour) {
      return {
        id: crypto.randomUUID(),
        userId: request.userId,
        type: 'TRANSACTION_VELOCITY_EXCEEDED',
        currency: request.currency,
        attemptedAmount: request.amount,
        attemptedAction: request.action,
        limitAmount: limits.maxTransactionsPerHour,
        limitType: 'TRANSACTION',
        source: request.source,
        sourceId: request.sourceId,
        metadata: request.metadata,
        action: 'ALLOWED_WITH_WARNING',
        warningMessage: 'Transaction velocity limit approached',
        createdAt: Date.now(),
      };
    }

    return null;
  }

  /**
   * Evaluate a single protection rule
   */
  async evaluateProtectionRule(
    rule: EconomyProtectionRule,
    request: TransactionValidationRequest
  ): Promise<BoundaryViolation | null> {
    // Check if rule conditions match
    if (rule.conditions.currency && rule.conditions.currency !== request.currency) {return null;}
    if (rule.conditions.userLevel && rule.conditions.userLevel > request.userLevel) {return null;}
    if (rule.conditions.isPremium !== null && rule.conditions.isPremium !== request.isPremiumUser) {return null;}
    if (rule.conditions.minAmount && request.amount < rule.conditions.minAmount) {return null;}
    if (rule.conditions.maxAmount && request.amount > rule.conditions.maxAmount) {return null;}

    // Check recent activity within time window
    const recentCount = await this.getRecentTransactionCount(request.userId, rule.conditions.timeWindow);

    if (recentCount >= rule.conditions.maxCount) {
      const action = rule.actions.block ? 'BLOCKED' :
                    rule.actions.warn ? 'ALLOWED_WITH_WARNING' : 'DETECTED';

      return {
        id: crypto.randomUUID(),
        userId: request.userId,
        type: 'SUSPICIOUS_PATTERN',
        currency: request.currency,
        attemptedAmount: request.amount,
        attemptedAction: request.action,
        limitAmount: rule.conditions.maxCount,
        limitType: 'TRANSACTION',
        source: request.source,
        sourceId: request.sourceId,
        metadata: { ruleId: rule.id, ruleName: rule.name },
        action,
        warningMessage: rule.actions.customMessage,
        createdAt: Date.now(),
      };
    }

    return null;
  }

  /**
   * Evaluate a single monetization boundary
   */
  async evaluateMonetizationBoundary(
    boundary: MonetizationBoundary,
    request: TransactionValidationRequest
  ): Promise<BoundaryViolation | null> {
    // Check if boundary applies
    if (boundary.currency && boundary.currency !== request.currency) {return null;}
    if (boundary.conditions.minLevel && boundary.conditions.minLevel > request.userLevel) {return null;}

    // Check if user has required entitlements
    const requiredEntitlements = boundary.conditions.requiredEntitlements;
    if (requiredEntitlements && requiredEntitlements.length > 0 && !request.isPremiumUser) {
      return {
        id: crypto.randomUUID(),
        userId: request.userId,
        type: 'PREMIUM_FEATURE_ABUSE',
        currency: request.currency,
        attemptedAmount: request.amount,
        attemptedAction: request.action,
        limitAmount: boundary.freeUserLimit,
        limitType: 'DAILY',
        source: request.source,
        sourceId: request.sourceId,
        metadata: { boundaryId: boundary.id, boundaryName: boundary.name },
        action: boundary.enforcement === 'HARD_BLOCK' ? 'BLOCKED' : 'ALLOWED_WITH_WARNING',
        warningMessage: `This feature requires Premium: ${boundary.description}`,
        createdAt: Date.now(),
      };
    }

    return null;
  }

  // ============================================================================
  // Helper Methods (would be implemented with actual database queries)
  // ============================================================================

  private async getTodayEarnings(userId: string, currency: string): Promise<number> {
    // In a real implementation, this would query the database
    // For now, return a simulated value
    return Math.random() * 500;
  }

  private async getCurrentBalance(userId: string, currency: string): Promise<number> {
    // In a real implementation, this would query the wallet
    // For now, return a simulated value
    return Math.random() * 5000;
  }

  private async getRecentTransactionCount(userId: string, timeWindowSeconds: number): Promise<number> {
    // In a real implementation, this would query recent transactions
    // For now, return a simulated value
    return Math.floor(Math.random() * 50);
  }

  // ============================================================================
  // Configuration Management
  // ============================================================================

  updateCurrencyLimits(currency: string, limits: Partial<CurrencyLimits>): void {
    const currentLimits = this.currencyLimits[currency];
    if (currentLimits) {
      this.currencyLimits[currency] = { ...currentLimits, ...limits };
    }
  }

  addMonetizationBoundary(boundary: MonetizationBoundary): void {
    this.monetizationBoundaries.push(boundary);
  }

  addProtectionRule(rule: EconomyProtectionRule): void {
    this.protectionRules.push(rule);
  }

  getCurrencyLimits(): Record<string, CurrencyLimits> {
    return { ...this.currencyLimits };
  }

  getMonetizationBoundaries(): MonetizationBoundary[] {
    return [...this.monetizationBoundaries];
  }

  getProtectionRules(): EconomyProtectionRule[] {
    return [...this.protectionRules];
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const currencyBoundariesValidationCore = new CurrencyBoundariesValidationCore();
