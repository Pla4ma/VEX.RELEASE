/**
 * Anti-Duplication Core Service
 *
 * Phase 6.04 - Anti-Duplication Systems
 * Core deduplication logic separated to comply with file size limits
 * Handles rule evaluation, exploit detection, and key management
 *
 * Dependencies:
 * - Economy (reward tracking, transaction validation)
 * - Rewards (reward delivery, claim tracking)
 * - Analytics (duplication detection, Sentry reporting)
 */

import * as Sentry from '@sentry/react-native';

import { eventBus } from '../../../events';
import type {
  DeduplicationRequest,
  DeduplicationResult,
  DeduplicationKey,
  DeduplicationRule,
  DeduplicationAttempt,
  ExploitPattern,
  ExploitDetection,
} from './schemas';
import { DEFAULT_DEDUPLICATION_RULES, DEFAULT_EXPLOIT_PATTERNS } from './config';

// ============================================================================
// Deduplication Core Service
// ============================================================================

class AntiDuplicationCore {
  private deduplicationRules: DeduplicationRule[] = DEFAULT_DEDUPLICATION_RULES;
  private exploitPatterns: ExploitPattern[] = DEFAULT_EXPLOIT_PATTERNS;
  private keyCache: Map<string, DeduplicationKey> = new Map();
  private attemptCache: Map<string, number> = new Map(); // For rate limiting

  /**
   * Find applicable deduplication rule
   */
  findRule(actionType: string): DeduplicationRule | null {
    return this.deduplicationRules.find(rule =>
      rule.actionType === actionType && rule.isActive
    ) || null;
  }

  /**
   * Check if request meets rule conditions
   */
  checkRuleConditions(rule: DeduplicationRule, request: DeduplicationRequest): boolean {
    const { conditions } = rule;

    // Check level requirements
    if (conditions.minLevel && request.userLevel < conditions.minLevel) {
      return false;
    }

    if (conditions.maxLevel && request.userLevel > conditions.maxLevel) {
      return false;
    }

    // Check entitlement requirements
    if (conditions.requiredEntitlements && conditions.requiredEntitlements.length > 0 && !request.isPremiumUser) {
      return false;
    }

    return true;
  }

  /**
   * Generate context key from rule template
   */
  generateContextKey(rule: DeduplicationRule, request: DeduplicationRequest): string {
    let key = rule.keyTemplate;

    // Replace template variables
    key = key.replace('{userId}', request.userId);
    key = key.replace('{actionType}', request.actionType);

    // Replace context data variables
    rule.keyVariables.forEach(variable => {
      const value = request.contextData[variable];
      if (value !== undefined) {
        key = key.replace(`{${variable}}`, String(value));
      }
    });

    // Handle date-based keys
    if (key.includes('{date}')) {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      key = key.replace('{date}', today);
    }

    return key;
  }

  /**
   * Get existing deduplication key
   */
  async getExistingKey(userId: string, contextKey: string): Promise<DeduplicationKey | null> {
    // Check cache first
    const cacheKey = `${userId}:${contextKey}`;
    const cached = this.keyCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // In a real implementation, this would query the database
    // For now, return null (simulating no existing key)
    return null;
  }

  /**
   * Check if a deduplication key has expired
   */
  isKeyExpired(key: DeduplicationKey): boolean {
    if (key.timeWindow === 0) {return false;} // Never expires
    if (!key.expiresAt) {return false;}

    return Date.now() > key.expiresAt;
  }

  /**
   * Mark a key as expired
   */
  async markKeyExpired(key: DeduplicationKey): Promise<void> {
    // In a real implementation, this would update the database
    // For now, just remove from cache
    const cacheKey = `${key.userId}:${key.contextKey}`;
    this.keyCache.delete(cacheKey);
  }

  /**
   * Create or update deduplication key
   */
  async createOrUpdateKey(
    request: DeduplicationRequest,
    contextKey: string,
    rule: DeduplicationRule
  ): Promise<string> {
    const now = Date.now();
    const expiresAt = rule.timeWindow > 0 ? now + (rule.timeWindow * 1000) : undefined;

    const key: DeduplicationKey = {
      id: crypto.randomUUID(),
      userId: request.userId,
      actionType: request.actionType,
      contextKey,
      contextData: request.contextData,
      timeWindow: rule.timeWindow,
      expiresAt,
      source: request.source,
      sourceId: request.sourceId,
      metadata: request.metadata,
      isUsed: true,
      usedAt: now,
      attempts: 1,
      createdAt: now,
      updatedAt: now,
    };

    // Cache the key
    const cacheKey = `${request.userId}:${contextKey}`;
    this.keyCache.set(cacheKey, key);

    // In a real implementation, this would save to the database
    return key.id;
  }

  /**
   * Check for exploit patterns
   */
  async checkExploitPatterns(request: DeduplicationRequest): Promise<ExploitDetection | null> {
    for (const pattern of this.exploitPatterns) {
      if (!pattern.isActive) {continue;}

      const detection = await this.evaluateExploitPattern(pattern, request);
      if (detection) {
        return detection;
      }
    }

    return null;
  }

  /**
   * Evaluate a single exploit pattern
   */
  async evaluateExploitPattern(
    pattern: ExploitPattern,
    request: DeduplicationRequest
  ): Promise<ExploitDetection | null> {
    // Check if pattern applies to this action type
    if (!pattern.criteria.actionTypes.includes(request.actionType)) {
      return null;
    }

    // Check level requirements
    if (pattern.criteria.minLevel && request.userLevel < pattern.criteria.minLevel) {
      return null;
    }

    // Check recent activity within time window
    const recentCount = await this.getRecentActionCount(
      request.userId,
      request.actionType,
      pattern.criteria.timeWindow
    );

    if (recentCount >= pattern.criteria.maxAttempts) {
      const confidence = Math.min(recentCount / pattern.criteria.maxAttempts, 1.0);

      if (confidence >= pattern.criteria.suspiciousThreshold) {
        const detection: ExploitDetection = {
          id: crypto.randomUUID(),
          userId: request.userId,
          patternId: pattern.id,
          patternName: pattern.name,
          triggerAction: request.actionType,
          triggerContext: JSON.stringify(request.contextData),
          triggerData: request.metadata || {},
          confidence,
          severity: confidence >= 0.9 ? 'HIGH' : confidence >= 0.7 ? 'MEDIUM' : 'LOW',
          actionsTaken: [],
          status: 'DETECTED',
          resolvedAt: null,
          resolutionNotes: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        // Determine actions to take
        if (pattern.actions.block) {
          detection.actionsTaken.push('blocked');
        }
        if (pattern.actions.flagForReview) {
          detection.actionsTaken.push('flagged_for_review');
        }
        if (pattern.actions.temporaryRestriction) {
          detection.actionsTaken.push('temporary_restriction');
        }
        if (pattern.actions.notifyAdmins) {
          detection.actionsTaken.push('notified_admins');
        }

        return detection;
      }
    }

    return null;
  }

  /**
   * Get recent action count for exploit detection
   */
  async getRecentActionCount(
    userId: string,
    actionType: string,
    timeWindowSeconds: number
  ): Promise<number> {
    // Check cache first
    const cacheKey = `${userId}:${actionType}:${timeWindowSeconds}`;
    const cached = this.attemptCache.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    // In a real implementation, this would query the database
    // For now, return a simulated value
    const count = Math.floor(Math.random() * 10);

    // Cache for a short time
    this.attemptCache.set(cacheKey, count);
    setTimeout(() => {
      this.attemptCache.delete(cacheKey);
    }, 60000); // 1 minute

    return count;
  }

  /**
   * Log deduplication attempt
   */
  async logAttempt(
    request: DeduplicationRequest,
    result: string,
    reason: string,
    rule: DeduplicationRule
  ): Promise<void> {
    const attempt: DeduplicationAttempt = {
      id: crypto.randomUUID(),
      userId: request.userId,
      actionType: request.actionType,
      contextKey: this.generateContextKey(rule, request),
      result: result as any,
      reason,
      source: request.source,
      sourceId: request.sourceId,
      metadata: request.metadata,
      createdAt: Date.now(),
    };

    // Track in Sentry
    Sentry.addBreadcrumb({
      category: 'anti-duplication',
      message: `Deduplication attempt: ${result}`,
      data: {
        userId: request.userId,
        actionType: request.actionType,
        result,
        reason,
      },
      level: result === 'BLOCKED_DUPLICATE' ? 'warning' : 'info',
    });

    // Emit event for cross-system integration
    eventBus.publish('anti-duplication:attempt_logged', {
      attempt,
      timestamp: Date.now(),
    });
  }

  /**
   * Log exploit detection
   */
  async logExploitDetection(detection: ExploitDetection): Promise<void> {
    // Track in Sentry
    Sentry.addBreadcrumb({
      category: 'anti-duplication',
      message: `Exploit detected: ${detection.patternName}`,
      data: {
        userId: detection.userId,
        pattern: detection.patternName,
        confidence: detection.confidence,
        severity: detection.severity,
      },
      level: detection.severity === 'HIGH' ? 'error' : 'warning',
    });

    // Emit event for cross-system integration
    eventBus.publish('anti-duplication:exploit_detected', {
      detection,
      timestamp: Date.now(),
    });
  }

  // ============================================================================
  // Result Creation Helpers
  // ============================================================================

  createErrorResult(reason: string): DeduplicationResult {
    return {
      allowed: false,
      deduplicationKey: null,
      result: 'ERROR',
      reason,
      warningMessage: null,
      existingKey: null,
      ruleApplied: null,
      requiresPremium: false,
      premiumUpgradeMessage: null,
    };
  }

  createBlockedResult(
    result: 'BLOCKED_DUPLICATE' | 'BLOCKED_RULE',
    reason: string,
    rule: DeduplicationRule
  ): DeduplicationResult {
    return {
      allowed: false,
      deduplicationKey: null,
      result,
      reason,
      warningMessage: rule.actions.customMessage,
      existingKey: null,
      ruleApplied: rule,
      requiresPremium: false,
      premiumUpgradeMessage: null,
    };
  }

  createDuplicateResult(existingKey: DeduplicationKey, rule: DeduplicationRule): DeduplicationResult {
    return {
      allowed: false,
      deduplicationKey: null,
      result: 'BLOCKED_DUPLICATE',
      reason: 'Duplicate action detected',
      warningMessage: rule.actions.customMessage,
      existingKey,
      ruleApplied: rule,
      requiresPremium: false,
      premiumUpgradeMessage: null,
    };
  }

  // ============================================================================
  // Configuration Management
  // ============================================================================

  addDeduplicationRule(rule: DeduplicationRule): void {
    this.deduplicationRules.push(rule);
  }

  updateDeduplicationRule(ruleId: string, updates: Partial<DeduplicationRule>): void {
    const index = this.deduplicationRules.findIndex(r => r.id === ruleId);
    if (index !== -1) {
      this.deduplicationRules[index] = { ...this.deduplicationRules[index], ...updates };
    }
  }

  addExploitPattern(pattern: ExploitPattern): void {
    this.exploitPatterns.push(pattern);
  }

  updateExploitPattern(patternId: string, updates: Partial<ExploitPattern>): void {
    const index = this.exploitPatterns.findIndex(p => p.id === patternId);
    if (index !== -1) {
      this.exploitPatterns[index] = { ...this.exploitPatterns[index], ...updates };
    }
  }

  getDeduplicationRules(): DeduplicationRule[] {
    return [...this.deduplicationRules];
  }

  getExploitPatterns(): ExploitPattern[] {
    return [...this.exploitPatterns];
  }

  // ============================================================================
  // Cache Management
  // ============================================================================

  clearCache(): void {
    this.keyCache.clear();
    this.attemptCache.clear();
  }

  getCacheStats(): { keys: number; attempts: number } {
    return {
      keys: this.keyCache.size,
      attempts: this.attemptCache.size,
    };
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const antiDuplicationCore = new AntiDuplicationCore();
