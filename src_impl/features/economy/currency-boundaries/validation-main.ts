/**
 * Currency Boundaries Validation Main Service
 *
 * Phase 6.03 - Currency And Monetization Boundaries
 * Main validation orchestrator for currency boundaries
 * Coordinates validation logic and handles result processing
 *
 * Dependencies:
 * - Economy (wallet operations, transaction tracking)
 * - Monetization (premium tier validation)
 * - Analytics (violation tracking, Sentry reporting)
 */

import * as Sentry from '@sentry/react-native';

import { eventBus } from '../../../events';
import { currencyBoundariesValidationCore } from './validation-core';
import type {
  TransactionValidationRequest,
  TransactionValidationResult,
  BoundaryViolation,
  CurrencyLimits,
  MonetizationBoundary,
  EconomyProtectionRule,
} from './schemas';

// ============================================================================
// Validation Main Service
// ============================================================================

class CurrencyBoundariesValidationMain {
  /**
   * Validate a transaction against all currency boundaries
   */
  async validateTransaction(request: TransactionValidationRequest): Promise<TransactionValidationResult> {
    const violations: BoundaryViolation[] = [];
    let allowed = true;
    let reason: string | null = null;
    let warningMessage: string | null = null;
    let adjustedAmount: number | null = null;
    let requiresPremium = false;
    let premiumUpgradeMessage: string | null = null;

    try {
      // Get currency limits
      const limits = currencyBoundariesValidationCore.getCurrencyLimits()[request.currency];
      if (!limits) {
        throw new Error(`No limits defined for currency: ${request.currency}`);
      }

      // Check daily earnings limit
      const dailyEarningsViolation = await currencyBoundariesValidationCore.checkDailyEarningsLimit(request, limits);
      if (dailyEarningsViolation) {
        violations.push(dailyEarningsViolation);
        if (dailyEarningsViolation.type === 'DAILY_EARNING_EXCEEDED') {
          allowed = false;
          reason = 'Daily earnings limit exceeded';
          requiresPremium = true;
          premiumUpgradeMessage = 'Upgrade to Premium for higher daily earning limits';
        }
      }

      // Check wallet cap
      const walletCapViolation = await currencyBoundariesValidationCore.checkWalletCap(request, limits);
      if (walletCapViolation) {
        violations.push(walletCapViolation);
        if (walletCapViolation.type === 'WALLET_CAP_EXCEEDED') {
          allowed = false;
          reason = 'Wallet cap exceeded';
          requiresPremium = true;
          premiumUpgradeMessage = 'Upgrade to Premium for higher wallet limits';
        }
      }

      // Check single transaction limit
      const singleTransactionViolation = await currencyBoundariesValidationCore.checkSingleTransactionLimit(request, limits);
      if (singleTransactionViolation) {
        violations.push(singleTransactionViolation);
        if (singleTransactionViolation.type === 'SINGLE_TRANSACTION_LIMIT_EXCEEDED') {
          allowed = false;
          reason = 'Single transaction limit exceeded';
          adjustedAmount = limits.maxSingleEarn;
        }
      }

      // Check transaction velocity
      const velocityViolation = await currencyBoundariesValidationCore.checkTransactionVelocity(request);
      if (velocityViolation) {
        violations.push(velocityViolation);
        if (velocityViolation.type === 'TRANSACTION_VELOCITY_EXCEEDED') {
          warningMessage = 'You are approaching transaction limits';
        }
      }

      // Check protection rules
      const protectionViolations = await this.checkProtectionRules(request);
      violations.push(...protectionViolations);

      // Check monetization boundaries
      const boundaryViolations = await this.checkMonetizationBoundaries(request);
      violations.push(...boundaryViolations);

      // Determine final result
      if (violations.some(v => v.action === 'BLOCKED')) {
        allowed = false;
      }

      if (violations.some(v => v.action === 'ALLOWED_WITH_WARNING')) {
        warningMessage = 'Transaction allowed with warning';
      }

      // Log violations
      if (violations.length > 0) {
        await this.logViolations(violations);
      }

      return {
        allowed,
        reason,
        warningMessage,
        adjustedAmount,
        violations,
        requiresPremium,
        premiumUpgradeMessage,
      };

    } catch (error) {
      Sentry.captureException(error, {
        tags: { feature: 'currency-boundaries-validation' },
        extra: { request },
      });

      return {
        allowed: false,
        reason: 'Validation system error',
        warningMessage: null,
        adjustedAmount: null,
        violations: [],
        requiresPremium: false,
        premiumUpgradeMessage: null,
      };
    }
  }

  /**
   * Check protection rules
   */
  private async checkProtectionRules(
    request: TransactionValidationRequest
  ): Promise<BoundaryViolation[]> {
    const violations: BoundaryViolation[] = [];
    const protectionRules = currencyBoundariesValidationCore.getProtectionRules();

    for (const rule of protectionRules) {
      if (!rule.isActive) {continue;}

      const violation = await currencyBoundariesValidationCore.evaluateProtectionRule(rule, request);
      if (violation) {
        violations.push(violation);
      }
    }

    return violations;
  }

  /**
   * Check monetization boundaries
   */
  private async checkMonetizationBoundaries(
    request: TransactionValidationRequest
  ): Promise<BoundaryViolation[]> {
    const violations: BoundaryViolation[] = [];
    const monetizationBoundaries = currencyBoundariesValidationCore.getMonetizationBoundaries();

    for (const boundary of monetizationBoundaries) {
      if (!boundary.isActive) {continue;}

      const violation = await currencyBoundariesValidationCore.evaluateMonetizationBoundary(boundary, request);
      if (violation) {
        violations.push(violation);
      }
    }

    return violations;
  }

  /**
   * Log violations to analytics and emit events
   */
  private async logViolations(violations: BoundaryViolation[]): Promise<void> {
    for (const violation of violations) {
      // Track in Sentry
      Sentry.addBreadcrumb({
        category: 'currency-boundaries',
        message: `Boundary violation: ${violation.type}`,
        data: {
          userId: violation.userId,
          currency: violation.currency,
          amount: violation.attemptedAmount,
          action: violation.attemptedAction,
        },
        level: violation.action === 'BLOCKED' ? 'warning' : 'info',
      });

      // Emit event for cross-system integration
      eventBus.emit('currency-boundaries:violation_detected', {
        violation,
        timestamp: Date.now(),
      });
    }
  }

  // ============================================================================
  // Configuration Management (delegates to core)
  // ============================================================================

  updateCurrencyLimits(currency: string, limits: Partial<CurrencyLimits>): void {
    currencyBoundariesValidationCore.updateCurrencyLimits(currency, limits);
  }

  addMonetizationBoundary(boundary: MonetizationBoundary): void {
    currencyBoundariesValidationCore.addMonetizationBoundary(boundary);
  }

  addProtectionRule(rule: EconomyProtectionRule): void {
    currencyBoundariesValidationCore.addProtectionRule(rule);
  }

  getCurrencyLimits(): Record<string, CurrencyLimits> {
    return currencyBoundariesValidationCore.getCurrencyLimits();
  }

  getMonetizationBoundaries(): MonetizationBoundary[] {
    return currencyBoundariesValidationCore.getMonetizationBoundaries();
  }

  getProtectionRules(): EconomyProtectionRule[] {
    return currencyBoundariesValidationCore.getProtectionRules();
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const currencyBoundariesValidationService = new CurrencyBoundariesValidationMain();
