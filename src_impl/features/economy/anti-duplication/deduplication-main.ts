/**
 * Anti-Duplication Main Service
 *
 * Phase 6.04 - Anti-Duplication Systems
 * Main deduplication orchestrator separated to comply with file size limits
 * Coordinates validation logic and handles result processing
 *
 * Dependencies:
 * - Economy (reward tracking, transaction validation)
 * - Rewards (reward delivery, claim tracking)
 * - Analytics (duplication detection, Sentry reporting)
 */

import * as Sentry from '@sentry/react-native';

import { antiDuplicationCore } from './deduplication-core';
import type {
  DeduplicationRequest,
  DeduplicationResult,
  DeduplicationRule,
  ExploitDetection,
} from './schemas';

// ============================================================================
// Deduplication Main Service
// ============================================================================

class AntiDuplicationMain {
  /**
   * Validate an action against deduplication rules
   */
  async validateDeduplication(request: DeduplicationRequest): Promise<DeduplicationResult> {
    const startTime = Date.now();

    try {
      // Find applicable rule
      const rule = antiDuplicationCore.findRule(request.actionType);
      if (!rule) {
        return antiDuplicationCore.createErrorResult('No deduplication rule found for action type');
      }

      // Check rule conditions
      if (!antiDuplicationCore.checkRuleConditions(rule, request)) {
        return antiDuplicationCore.createBlockedResult('BLOCKED_RULE', 'Action not allowed by rule conditions', rule);
      }

      // Generate context key
      const contextKey = antiDuplicationCore.generateContextKey(rule, request);

      // Check for existing key
      const existingKey = await antiDuplicationCore.getExistingKey(request.userId, contextKey);

      if (existingKey && existingKey.isUsed) {
        // Check if key has expired
        if (antiDuplicationCore.isKeyExpired(existingKey)) {
          await antiDuplicationCore.markKeyExpired(existingKey);
        } else {
          // Duplicate detected
          await antiDuplicationCore.logAttempt(request, 'BLOCKED_DUPLICATE', 'Duplicate action detected', rule);
          return antiDuplicationCore.createDuplicateResult(existingKey, rule);
        }
      }

      // Check for exploit patterns
      const exploitDetection = await antiDuplicationCore.checkExploitPatterns(request);
      if (exploitDetection) {
        await antiDuplicationCore.logExploitDetection(exploitDetection);
        if (exploitDetection.actionsTaken.includes('block')) {
          return antiDuplicationCore.createBlockedResult('BLOCKED_RULE', 'Exploitative behavior detected', rule);
        }
      }

      // Create or update deduplication key
      const deduplicationKey = await antiDuplicationCore.createOrUpdateKey(request, contextKey, rule);

      // Log successful validation
      await antiDuplicationCore.logAttempt(request, 'ALLOWED', 'Action allowed', rule);

      // Track performance
      const validationTime = Date.now() - startTime;
      if (validationTime > 1000) {
        Sentry.addBreadcrumb({
          category: 'anti-duplication',
          message: 'Slow deduplication validation',
          data: { validationTime, actionType: request.actionType },
          level: 'warning',
        });
      }

      return {
        allowed: true,
        deduplicationKey,
        result: 'ALLOWED',
        reason: null,
        warningMessage: null,
        existingKey: null,
        ruleApplied: rule,
        requiresPremium: false,
        premiumUpgradeMessage: null,
      };

    } catch (error) {
      Sentry.captureException(error, {
        tags: { feature: 'anti-duplication-validation' },
        extra: { request },
      });

      return antiDuplicationCore.createErrorResult('Validation system error');
    }
  }

  // ============================================================================
  // Configuration Management (delegates to core)
  // ============================================================================

  addDeduplicationRule(rule: DeduplicationRule): void {
    antiDuplicationCore.addDeduplicationRule(rule);
  }

  updateDeduplicationRule(ruleId: string, updates: Partial<DeduplicationRule>): void {
    antiDuplicationCore.updateDeduplicationRule(ruleId, updates);
  }

  addExploitPattern(pattern: ExploitPattern): void {
    antiDuplicationCore.addExploitPattern(pattern);
  }

  updateExploitPattern(patternId: string, updates: Partial<ExploitPattern>): void {
    antiDuplicationCore.updateExploitPattern(patternId, updates);
  }

  getDeduplicationRules(): DeduplicationRule[] {
    return antiDuplicationCore.getDeduplicationRules();
  }

  getExploitPatterns(): ExploitPattern[] {
    return antiDuplicationCore.getExploitPatterns();
  }

  // ============================================================================
  // Cache Management (delegates to core)
  // ============================================================================

  clearCache(): void {
    antiDuplicationCore.clearCache();
  }

  getCacheStats(): { keys: number; attempts: number } {
    return antiDuplicationCore.getCacheStats();
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const antiDuplicationService = new AntiDuplicationMain();
