/**
 * Adaptive Difficulty Engine
 *
 * Phase 6: AI Evolution
 * Dynamically adjusts boss difficulty based on user performance
 *
 * Instead of static boss stats, this engine:
 * - Tracks user performance over 7 days
 * - >90% completion = Increase boss health by 10%
 * - <50% completion = Offer "Recovery Mode"
 * - Always tunes to edge of ability (flow state)
 *
 * Difficulty Factors:
 * - Boss health scaling
 * - Attack frequency
 * - Purity thresholds
 * - Time pressure
 *
 * Dependencies:
 * - features/boss (boss templates)
 * - session/SessionService (performance data)
 * - feature-flags (gradual rollout)
 */

import { z } from 'zod';
import { featureFlags } from '../../feature-flags/FeatureFlagEngine';
import { eventBus } from '../../events';

// ============================================================================
// Difficulty Types
// ============================================================================

export type DifficultyRating = 'EASY' | 'NORMAL' | 'HARD' | 'EXTREME';

export interface UserPerformanceMetrics {
  userId: string;

  // Last 7 days
  sessionsAttempted: number;
  sessionsCompleted: number;
  completionRate: number; // 0-1

  // Quality metrics
  averagePurity: number; // 0-100
  averageGrade: 'S' | 'A' | 'B' | 'C' | 'D';
  perfectSessions: number;

  // Trend
  trendDirection: 'improving' | 'stable' | 'declining';
  consistencyScore: number; // 0-100

  // Boss-specific
  bossDefeatRate: number; // 0-1
  averageBossDamage: number;

  lastUpdated: number;
}

export interface AdaptiveBossConfig {
  baseHealth: number;
  healthMultiplier: number;
  attackFrequency: number; // attacks per 10 min
  purityThreshold: number; // 0-100
  timeLimit: number; // seconds
  recommendedMode: 'FLOW' | 'CHALLENGE' | 'RECOVERY';
}

export interface DifficultyAdjustment {
  reason: string;
  previousRating: DifficultyRating;
  newRating: DifficultyRating;
  changes: {
    healthChange: number; // percentage
    attackFreqChange: number;
    purityThresholdChange: number;
  };
  messageToUser: string;
}

// ============================================================================
// Adaptive Difficulty Engine
// ============================================================================

export class AdaptiveDifficultyEngine {
  private userMetrics: Map<string, UserPerformanceMetrics> = new Map();
  private difficultyRatings: Map<string, DifficultyRating> = new Map();

  /**
   * Check if adaptive difficulty is enabled
   */
  static isEnabled(): boolean {
    return featureFlags.isEnabled('adaptive_difficulty');
  }

  /**
   * Update user performance metrics
   */
  updateMetrics(
    userId: string,
    sessionResults: Array<{
      completed: boolean;
      purity: number;
      grade: string;
      duration: number;
      bossDefeated: boolean;
      bossDamage: number;
    }>,
  ): UserPerformanceMetrics {
    if (!AdaptiveDifficultyEngine.isEnabled()) {
      return this.getDefaultMetrics(userId);
    }

    const last7Days = sessionResults.slice(-7);

    const attempted = last7Days.length;
    const completed = last7Days.filter((s) => s.completed).length;
    const completionRate = attempted > 0 ? completed / attempted : 0.5;

    const avgPurity = last7Days.length > 0 ? last7Days.reduce((sum, s) => sum + s.purity, 0) / last7Days.length : 75;

    // Calculate grade distribution
    const grades = last7Days.map((s) => s.grade);
    const perfectSessions = grades.filter((g) => g === 'S').length;

    // Determine dominant grade
    const gradeOrder = ['S', 'A', 'B', 'C', 'D'];
    let averageGrade: UserPerformanceMetrics['averageGrade'] = 'C';
    for (const grade of gradeOrder) {
      if (grades.includes(grade)) {
        averageGrade = grade as UserPerformanceMetrics['averageGrade'];
        break;
      }
    }

    // Calculate trend
    const firstHalf = last7Days.slice(0, 3);
    const secondHalf = last7Days.slice(4);
    const firstHalfRate = firstHalf.filter((s) => s.completed).length / Math.max(1, firstHalf.length);
    const secondHalfRate = secondHalf.filter((s) => s.completed).length / Math.max(1, secondHalf.length);

    let trendDirection: UserPerformanceMetrics['trendDirection'] = 'stable';
    if (secondHalfRate > firstHalfRate * 1.2) {
      trendDirection = 'improving';
    } else if (secondHalfRate < firstHalfRate * 0.8) {
      trendDirection = 'declining';
    }

    // Consistency score (inverse of variance)
    const purityValues = last7Days.map((s) => s.purity);
    const avg = avgPurity;
    const variance = purityValues.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / Math.max(1, purityValues.length);
    const consistencyScore = Math.max(0, 100 - variance);

    // Boss metrics
    const bossFights = last7Days.filter((s) => s.bossDamage > 0);
    const bossDefeatRate = bossFights.length > 0 ? bossFights.filter((s) => s.bossDefeated).length / bossFights.length : 0.5;
    const averageBossDamage = bossFights.length > 0 ? bossFights.reduce((sum, s) => sum + s.bossDamage, 0) / bossFights.length : 0;

    const metrics: UserPerformanceMetrics = {
      userId,
      sessionsAttempted: attempted,
      sessionsCompleted: completed,
      completionRate,
      averagePurity: avgPurity,
      averageGrade,
      perfectSessions,
      trendDirection,
      consistencyScore,
      bossDefeatRate,
      averageBossDamage,
      lastUpdated: Date.now(),
    };

    this.userMetrics.set(userId, metrics);

    // Auto-adjust difficulty
    this.adjustDifficulty(userId);

    return metrics;
  }

  /**
   * Get recommended difficulty rating for user
   */
  getRecommendedDifficulty(userId: string): {
    rating: DifficultyRating;
    config: AdaptiveBossConfig;
    reason: string;
    message: string;
  } {
    if (!AdaptiveDifficultyEngine.isEnabled()) {
      return {
        rating: 'NORMAL',
        config: this.getDefaultConfig(),
        reason: 'Adaptive difficulty disabled',
        message: 'Standard difficulty selected',
      };
    }

    const metrics = this.userMetrics.get(userId);
    const rating = this.difficultyRatings.get(userId) || 'NORMAL';

    if (!metrics) {
      return {
        rating,
        config: this.getDefaultConfig(),
        reason: 'No performance data',
        message: 'Complete some sessions to unlock adaptive difficulty!',
      };
    }

    const config = this.calculateConfig(rating, metrics);

    return {
      rating,
      config,
      reason: this.getDifficultyReason(metrics),
      message: this.getDifficultyMessage(rating, metrics),
    };
  }

  /**
   * Manually override difficulty (for testing or user preference)
   */
  setDifficulty(userId: string, rating: DifficultyRating): DifficultyAdjustment {
    const previousRating = this.difficultyRatings.get(userId) || 'NORMAL';
    const metrics = this.userMetrics.get(userId);

    this.difficultyRatings.set(userId, rating);

    const oldConfig = this.calculateConfig(previousRating, metrics);
    const newConfig = this.calculateConfig(rating, metrics);

    return {
      reason: 'Manual override',
      previousRating,
      newRating: rating,
      changes: {
        healthChange: ((newConfig.baseHealth * newConfig.healthMultiplier) / (oldConfig.baseHealth * oldConfig.healthMultiplier) - 1) * 100,
        attackFreqChange: ((newConfig.attackFrequency - oldConfig.attackFrequency) / oldConfig.attackFrequency) * 100,
        purityThresholdChange: newConfig.purityThreshold - oldConfig.purityThreshold,
      },
      messageToUser: `Difficulty set to ${rating}. Boss health ${newConfig.healthMultiplier > 1 ? 'increased' : 'decreased'} by ${Math.abs((newConfig.healthMultiplier - 1) * 100).toFixed(0)}%`,
    };
  }

  /**
   * Get difficulty progression suggestion
   */
  getProgressionSuggestion(userId: string): {
    shouldChange: boolean;
    suggestedRating: DifficultyRating;
    confidence: number;
    reason: string;
  } {
    const metrics = this.userMetrics.get(userId);
    const currentRating = this.difficultyRatings.get(userId) || 'NORMAL';

    if (!metrics) {
      return { shouldChange: false, suggestedRating: currentRating, confidence: 0, reason: 'No data' };
    }

    // Suggest increase if performing very well
    if (metrics.completionRate > 0.9 && metrics.averagePurity > 80 && currentRating !== 'EXTREME') {
      const nextRating = this.getNextRating(currentRating);
      return {
        shouldChange: true,
        suggestedRating: nextRating,
        confidence: metrics.completionRate,
        reason: `Excellent performance: ${Math.floor(metrics.completionRate * 100)}% completion rate, ${Math.floor(metrics.averagePurity)}% avg purity`,
      };
    }

    // Suggest decrease if struggling
    if (metrics.completionRate < 0.5 && currentRating !== 'EASY') {
      const prevRating = this.getPreviousRating(currentRating);
      return {
        shouldChange: true,
        suggestedRating: prevRating,
        confidence: 1 - metrics.completionRate,
        reason: `Struggling: ${Math.floor(metrics.completionRate * 100)}% completion rate. Try easier difficulty.`,
      };
    }

    // Suggest recovery mode if declining trend
    if (metrics.trendDirection === 'declining' && metrics.completionRate < 0.6) {
      return {
        shouldChange: true,
        suggestedRating: 'EASY',
        confidence: 0.7,
        reason: 'Performance declining. Take it easy for a bit.',
      };
    }

    return { shouldChange: false, suggestedRating: currentRating, confidence: 0, reason: 'Current difficulty appropriate' };
  }

  /**
   * Get current metrics for display
   */
  getMetrics(userId: string): UserPerformanceMetrics | null {
    return this.userMetrics.get(userId) || null;
  }

  /**
   * Apply boss config to encounter
   */
  applyConfigToBoss(
    baseBoss: {
      id: string;
      name: string;
      baseHealth: number;
      attackFrequency: number;
      purityThreshold: number;
      timeLimit: number;
    },
    userId: string,
  ): {
    id: string;
    name: string;
    health: number;
    attackFrequency: number;
    purityThreshold: number;
    timeLimit: number;
    difficultyRating: DifficultyRating;
  } {
    const { config, rating } = this.getRecommendedDifficulty(userId);

    return {
      id: baseBoss.id,
      name: baseBoss.name,
      health: Math.floor(baseBoss.baseHealth * config.healthMultiplier),
      attackFrequency: Math.max(1, baseBoss.attackFrequency * (config.attackFrequency / 2)),
      purityThreshold: config.purityThreshold,
      timeLimit: config.timeLimit,
      difficultyRating: rating,
    };
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private adjustDifficulty(userId: string): DifficultyAdjustment | null {
    const metrics = this.userMetrics.get(userId);
    if (!metrics) {
      return null;
    }

    const currentRating = this.difficultyRatings.get(userId) || 'NORMAL';

    // Auto-adjust rules
    let newRating = currentRating;

    // Increase if crushing it
    if (metrics.completionRate > 0.9 && metrics.bossDefeatRate > 0.8) {
      newRating = this.getNextRating(currentRating);
    }
    // Decrease if struggling
    else if (metrics.completionRate < 0.5 || metrics.bossDefeatRate < 0.3) {
      newRating = this.getPreviousRating(currentRating);
    }

    if (newRating === currentRating) {
      return null;
    }

    this.difficultyRatings.set(userId, newRating);

    const oldConfig = this.calculateConfig(currentRating, metrics);
    const newConfig = this.calculateConfig(newRating, metrics);

    const adjustment: DifficultyAdjustment = {
      reason: this.getAdjustmentReason(metrics),
      previousRating: currentRating,
      newRating,
      changes: {
        healthChange: ((newConfig.baseHealth * newConfig.healthMultiplier) / (oldConfig.baseHealth * oldConfig.healthMultiplier) - 1) * 100,
        attackFreqChange: ((newConfig.attackFrequency - oldConfig.attackFrequency) / oldConfig.attackFrequency) * 100,
        purityThresholdChange: newConfig.purityThreshold - oldConfig.purityThreshold,
      },
      messageToUser: this.getAdjustmentMessage(newRating, metrics),
    };

    // Event publishing re-enabled with fixed channel types
    eventBus.publish('adaptive_difficulty:real_time_adjustment', {
      userId: metrics.userId,
      encounterId: metrics.userId,
      adjustment: 0,
      reason: adjustment.reason,
      timestamp: Date.now(),
    });

    return adjustment;
  }

  private calculateConfig(rating: DifficultyRating, metrics: UserPerformanceMetrics | undefined): AdaptiveBossConfig {
    const baseConfigs: Record<DifficultyRating, AdaptiveBossConfig> = {
      EASY: {
        baseHealth: 800,
        healthMultiplier: 0.7,
        attackFrequency: 1,
        purityThreshold: 60,
        timeLimit: 3600, // 1 hour grace
        recommendedMode: 'RECOVERY',
      },
      NORMAL: {
        baseHealth: 1000,
        healthMultiplier: 1.0,
        attackFrequency: 2,
        purityThreshold: 75,
        timeLimit: 3300, // 55 min
        recommendedMode: 'FLOW',
      },
      HARD: {
        baseHealth: 1200,
        healthMultiplier: 1.3,
        attackFrequency: 3,
        purityThreshold: 85,
        timeLimit: 3000, // 50 min
        recommendedMode: 'CHALLENGE',
      },
      EXTREME: {
        baseHealth: 1500,
        healthMultiplier: 1.6,
        attackFrequency: 4,
        purityThreshold: 90,
        timeLimit: 2700, // 45 min
        recommendedMode: 'CHALLENGE',
      },
    };

    return baseConfigs[rating];
  }

  private getNextRating(current: DifficultyRating): DifficultyRating {
    const order: DifficultyRating[] = ['EASY', 'NORMAL', 'HARD', 'EXTREME'];
    const index = order.indexOf(current);
    return order[Math.min(index + 1, order.length - 1)];
  }

  private getPreviousRating(current: DifficultyRating): DifficultyRating {
    const order: DifficultyRating[] = ['EASY', 'NORMAL', 'HARD', 'EXTREME'];
    const index = order.indexOf(current);
    return order[Math.max(index - 1, 0)];
  }

  private getDifficultyReason(metrics: UserPerformanceMetrics): string {
    if (metrics.completionRate > 0.9) {
      return `Excellent performance (${Math.floor(metrics.completionRate * 100)}% completion)`;
    } else if (metrics.completionRate < 0.5) {
      return `Struggling with current difficulty (${Math.floor(metrics.completionRate * 100)}% completion)`;
    } else if (metrics.trendDirection === 'improving') {
      return 'Performance improving - stepping up difficulty';
    } else if (metrics.trendDirection === 'declining') {
      return 'Performance declining - easing difficulty';
    }
    return 'Maintaining appropriate challenge level';
  }

  private getDifficultyMessage(rating: DifficultyRating, metrics: UserPerformanceMetrics): string {
    const messages: Record<DifficultyRating, string> = {
      EASY: 'Recovery mode active. Focus on consistency, not perfection.',
      NORMAL: "Standard challenge level. You've got this!",
      HARD: 'Challenge mode! Push your limits and earn bigger rewards.',
      EXTREME: 'Extreme difficulty! Only for the truly disciplined.',
    };

    return messages[rating];
  }

  private getAdjustmentReason(metrics: UserPerformanceMetrics): string {
    if (metrics.completionRate > 0.9) {
      return `Auto-increased: ${Math.floor(metrics.completionRate * 100)}% completion rate indicates mastery`;
    } else if (metrics.completionRate < 0.5) {
      return `Auto-decreased: ${Math.floor(metrics.completionRate * 100)}% completion rate suggests difficulty too high`;
    }
    return 'Performance-based adjustment';
  }

  private getAdjustmentMessage(newRating: DifficultyRating, metrics: UserPerformanceMetrics): string {
    if (newRating === 'EASY' || newRating === 'NORMAL') {
      return `Difficulty ${newRating === 'EASY' ? 'reduced' : 'maintained'}. Focus on building your streak back up! 💪`;
    }
    return `Difficulty increased to ${newRating}! You're ready for the challenge! 🔥`;
  }

  private getDefaultConfig(): AdaptiveBossConfig {
    return {
      baseHealth: 1000,
      healthMultiplier: 1.0,
      attackFrequency: 2,
      purityThreshold: 75,
      timeLimit: 3300,
      recommendedMode: 'FLOW',
    };
  }

  private getDefaultMetrics(userId: string): UserPerformanceMetrics {
    return {
      userId,
      sessionsAttempted: 0,
      sessionsCompleted: 0,
      completionRate: 0.5,
      averagePurity: 75,
      averageGrade: 'B',
      perfectSessions: 0,
      trendDirection: 'stable',
      consistencyScore: 50,
      bossDefeatRate: 0.5,
      averageBossDamage: 500,
      lastUpdated: Date.now(),
    };
  }
}

// ============================================================================
// Factory & Singleton
// ============================================================================

let engine: AdaptiveDifficultyEngine | null = null;

export function getAdaptiveDifficultyEngine(): AdaptiveDifficultyEngine {
  if (!engine) {
    engine = new AdaptiveDifficultyEngine();
  }
  return engine;
}
