/**
 * Completion Engine
 *
 * Handles session completion flow including:
 * - Success completion
 * - Partial completion
 * - Abandon handling
 * - Failure recovery
 */

import type { SessionState, SessionSummary, SessionConfig, SessionStatus, FocusQualityMetrics } from '../types';
import { resolveSessionMode } from '../modes';
import type { ScoringEngine } from './ScoringEngine';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('session:completion');

// ============================================================================
// Completion Result Types
// ============================================================================

export interface CompletionResult {
  success: boolean;
  status: SessionStatus;
  summary: SessionSummary;
  rewardsGranted: boolean;
  streakMaintained: boolean;
  recoveryAvailable: boolean;
  error?: string;
}

export interface AbandonResult {
  sessionId: string;
  damage: DamageCalculation;
  canRecover: boolean;
  streakBroken: boolean;
  partialCredit: boolean;
}

// ============================================================================
// Completion Engine
// ============================================================================

export class CompletionEngine {
  private scoringEngine: ScoringEngine;

  constructor(scoringEngine: ScoringEngine) {
    this.scoringEngine = scoringEngine;
  }

  // ============================================================================
  // Success Completion
  // ============================================================================

  completeSession(
    session: SessionState,
    focusMetrics: FocusQualityMetrics,
    userStreak: number,
    reflection?: string,
    mood?: 'GREAT' | 'GOOD' | 'OKAY' | 'STRUGGLING' | 'DIFFICULT',
    tasksCompleted?: number
  ): CompletionResult {
    const now = Date.now();

    // Update session state
    session.status = 'COMPLETED';
    session.completedAt = now;
    session.endedAt = now;
    session.completionPercentage = 100;
    session.focusQuality = focusMetrics.overallScore;
    session.effectiveTime = session.config.duration * 1000;

    // Calculate final score
    const scoreCalc = this.scoringEngine.calculateScore(session, focusMetrics);
    const finalScore = this.scoringEngine.calculateFinalScore(scoreCalc);

    session.baseScore = scoreCalc.basePoints;
    session.timeBonus = scoreCalc.timeBonus;
    session.streakBonus = scoreCalc.streakBonus;

    // Create summary
    const summary = this.createSessionSummary(
      session,
      scoreCalc,
      finalScore,
      focusMetrics,
      userStreak,
      reflection,
      mood,
      tasksCompleted
    );

    // Streak is maintained on completion
    const streakMaintained = true;

    debug.info('Session %s completed successfully. Score: %d, Streak maintained: %s',
      session.id, finalScore, streakMaintained);

    return {
      success: true,
      status: 'COMPLETED',
      summary,
      rewardsGranted: true,
      streakMaintained,
      recoveryAvailable: false,
    };
  }

  // ============================================================================
  // Partial Completion
  // ============================================================================

  completePartial(
    session: SessionState,
    focusMetrics: FocusQualityMetrics,
    userStreak: number,
    reason: string,
    reflection?: string,
    mood?: 'GREAT' | 'GOOD' | 'OKAY' | 'STRUGGLING' | 'DIFFICULT'
  ): CompletionResult {
    const now = Date.now();

    // Update session state
    session.status = 'PARTIAL';
    session.completedAt = now;
    session.endedAt = now;
    session.focusQuality = focusMetrics.overallScore;

    // Calculate adjusted score based on completion percentage
    const scoreCalc = this.scoringEngine.calculateScore(session, focusMetrics);
    const penaltyMultiplier = session.completionPercentage / 100;
    const adjustedScore = this.scoringEngine.calculateFinalScore(scoreCalc) * penaltyMultiplier;

    // Update session
    session.baseScore = scoreCalc.basePoints * penaltyMultiplier;

    // Create summary
    const summary = this.createSessionSummary(
      session,
      scoreCalc,
      adjustedScore,
      focusMetrics,
      userStreak,
      reflection,
      mood
    );

    // Partial credit threshold
    const MIN_PARTIAL_CREDIT = 50;
    const streakMaintained = session.completionPercentage >= MIN_PARTIAL_CREDIT;
    const rewardsGranted = this.scoringEngine.isEligibleForRewards(session.completionPercentage);

    debug.info('Session %s partially completed (%d%%). Score: %d, Streak: %s',
      session.id, session.completionPercentage, adjustedScore, streakMaintained);

    return {
      success: rewardsGranted,
      status: 'PARTIAL',
      summary,
      rewardsGranted,
      streakMaintained,
      recoveryAvailable: session.recoveryAttempts < session.maxRecoveryAttempts,
    };
  }

  // ============================================================================
  // Abandon Handling
  // ============================================================================

  abandonSession(
    session: SessionState,
    reason?: string
  ): AbandonResult {
    const now = Date.now();

    // Update session state
    session.status = 'ABANDONED';
    session.abandonedAt = now;
    session.endedAt = now;

    // Calculate damage
    const damage = this.scoringEngine.calculateDamage(session, 'ABANDON');
    session.damagePoints = damage.totalDamage;
    session.penaltyMultiplier = damage.finalPenalty;

    // Determine recovery options
    const canRecover = session.recoveryAttempts < session.maxRecoveryAttempts;
    const partialCredit = session.effectiveTime > (session.config.duration * 1000 * 0.25);
    const streakBroken = !partialCredit;

    debug.info('Session %s abandoned (reason: %s). Damage: %d, Can recover: %s',
      session.id, reason || 'none', damage.totalDamage, canRecover);

    return {
      sessionId: session.id,
      damage,
      canRecover,
      streakBroken,
      partialCredit,
    };
  }

  // ============================================================================
  // Failure Handling
  // ============================================================================

  failSession(
    session: SessionState,
    error: string,
    canRecover: boolean = true
  ): AbandonResult {
    const now = Date.now();

    // Update session state
    session.status = 'FAILED';
    session.endedAt = now;

    // Calculate damage
    const damage = this.scoringEngine.calculateDamage(session, 'INTERRUPTION');
    session.damagePoints = damage.totalDamage;
    session.penaltyMultiplier = damage.finalPenalty;

    const streakBroken = session.effectiveTime < (session.config.duration * 1000 * 0.5);

    debug.info('Session %s failed (error: %s). Damage: %d',
      session.id, error, damage.totalDamage);

    return {
      sessionId: session.id,
      damage,
      canRecover: canRecover && session.recoveryAttempts < session.maxRecoveryAttempts,
      streakBroken,
      partialCredit: !streakBroken,
    };
  }

  // ============================================================================
  // Recovery Attempt
  // ============================================================================

  attemptRecovery(
    session: SessionState,
    recoveryType: 'USER_RESUME' | 'STREAK_SAVE' | 'PARTIAL_CREDIT',
    focusMetrics: FocusQualityMetrics,
    userStreak: number
  ): CompletionResult {
    session.recoveryAttempts++;
    session.lastRecoveryAt = Date.now();

    let success = false;
    let status: SessionStatus = 'RECOVERING';
    let summary: SessionSummary | undefined;

    switch (recoveryType) {
      case 'USER_RESUME':
        // User resumed manually - continue as normal
        session.status = 'ACTIVE';
        success = true;
        break;

      case 'STREAK_SAVE':
        // Streak was saved (e.g., using freeze) - grant partial credit
        if (session.completionPercentage >= 25) {
          session.completionPercentage = Math.max(session.completionPercentage, 50);
          status = 'PARTIAL';
          summary = this.completePartial(session, focusMetrics, userStreak, 'Streak saved').summary;
          success = true;
        }
        break;

      case 'PARTIAL_CREDIT':
        // Grant partial credit for effort
        session.completionPercentage = Math.max(session.completionPercentage, 30);
        status = 'PARTIAL';
        summary = this.completePartial(session, focusMetrics, userStreak, 'Partial credit granted').summary;
        success = true;
        break;
    }

    debug.info('Recovery attempted for session %s (type: %s). Success: %s',
      session.id, recoveryType, success);

    return {
      success,
      status,
      summary: summary!,
      rewardsGranted: success,
      streakMaintained: success,
      recoveryAvailable: session.recoveryAttempts < session.maxRecoveryAttempts,
    };
  }

  // ============================================================================
  // Summary Creation
  // ============================================================================

  private createSessionSummary(
    session: SessionState,
    scoreCalc: ScoreCalculation,
    finalScore: number,
    focusMetrics: FocusQualityMetrics,
    userStreak: number,
    reflection?: string,
    mood?: 'GREAT' | 'GOOD' | 'OKAY' | 'STRUGGLING' | 'DIFFICULT',
    tasksCompleted?: number
  ): SessionSummary {
    const plannedDuration = session.config.duration * 1000;
    const actualDuration = session.endedAt! - session.startedAt!;
    const focusPurityScore = this.scoringEngine.calculateFocusPurityScore(session);

    // Calculate XP (base + bonus)
    const xpEarned = Math.floor(finalScore * 0.1);

    // Calculate coins (based on completion and quality)
    const coinsEarned = Math.floor(
      (session.completionPercentage / 100) *
      focusMetrics.overallScore / 100 *
      50 // Base coins
    );

    // Gems for exceptional performance
    const gemsEarned = session.completionPercentage >= 100 && focusMetrics.overallScore >= 90
      ? 1
      : 0;
    const bonuses = scoreCalc.comebackBonus > 0
      ? [{
          type: 'COMEBACK_BONUS',
          amount: scoreCalc.comebackBonus,
          description: `${scoreCalc.comebackMultiplier}x comeback XP applied`,
        }]
      : [];
    const modeBonus = Math.max(0, scoreCalc.intervalBonus - this.getBaseIntervalBonus(session));

    return {
      sessionId: session.id,
      userId: session.userId,
      status: session.status,

      // Timing
      plannedDuration,
      actualDuration,
      effectiveDuration: session.effectiveTime,
      pausedDuration: session.pausedTime,

      // Performance
      completionPercentage: session.completionPercentage,
      focusQuality: focusMetrics.overallScore,
      focusPurityScore,
      interruptions: session.interruptions,
      pauses: session.pauses,

      // Scoring
      baseScore: scoreCalc.basePoints,
      timeBonus: scoreCalc.timeBonus,
      streakBonus: scoreCalc.streakBonus,
      finalScore,

      // Rewards
      xpEarned,
      coinsEarned,
      gemsEarned,

      // Bonuses
      bonuses,

      // Streak
      streakMaintained: true,
      streakIncreased: session.completionPercentage >= 100,
      streakDays: userStreak,
      userLevel: this.scoringEngine.getUserLevel(),
      isPerfect: scoreCalc.isPerfect,

      // Damage
      damageTaken: session.damagePoints,
      penaltiesApplied: session.antiCheatFlags,

      // Comparison (placeholders - would be calculated from history)
      vsAverage: 100,
      vsBest: 100,

      // Tasks
      tasksCompleted,
      tasksPlanned: session.config.estimatedTaskCount,

      // Reflection
      reflection,
      mood,
      sessionMode: resolveSessionMode(session.config.sessionMode),
      modeBonus,

      createdAt: Date.now(),
    };
  }

  private getBaseIntervalBonus(session: SessionState): number {
    if (session.intervalsCompleted >= 8) {return 80;}
    if (session.intervalsCompleted >= 4) {return 40;}
    if (session.intervalsCompleted >= 2) {return 15;}
    return 0;
  }

  // ============================================================================
  // Validation
  // ============================================================================

  validateCompletionEligibility(session: SessionState): {
    eligible: boolean;
    reason?: string;
  } {
    if (session.status === 'COMPLETED') {
      return { eligible: false, reason: 'Session already completed' };
    }

    if (session.status === 'ABANDONED') {
      return { eligible: false, reason: 'Session was abandoned' };
    }

    if (!session.startedAt) {
      return { eligible: false, reason: 'Session was never started' };
    }

    // Anti-cheat check
    if (session.antiCheatStatus === 'FAILED') {
      return { eligible: false, reason: 'Session failed anti-cheat validation' };
    }

    return { eligible: true };
  }

  // ============================================================================
  // Statistics
  // ============================================================================

  calculateSessionStats(
    session: SessionState,
    focusMetrics: FocusQualityMetrics
  ): {
    efficiency: number;
    focusRating: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'NEEDS_IMPROVEMENT';
    productivity: number;
    recommendations: string[];
  } {
    // Efficiency = effective time / total time
    const totalTime = session.endedAt! - session.startedAt!;
    const efficiency = totalTime > 0
      ? (session.effectiveTime / totalTime) * 100
      : 0;

    // Focus rating
    let focusRating: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'NEEDS_IMPROVEMENT';
    if (focusMetrics.overallScore >= 90) {
      focusRating = 'EXCELLENT';
    } else if (focusMetrics.overallScore >= 75) {
      focusRating = 'GOOD';
    } else if (focusMetrics.overallScore >= 50) {
      focusRating = 'AVERAGE';
    } else {
      focusRating = 'NEEDS_IMPROVEMENT';
    }

    // Productivity score (weighted combination)
    const productivity = Math.round(
      session.completionPercentage * 0.4 +
      efficiency * 0.3 +
      focusMetrics.overallScore * 0.3
    );

    // Generate recommendations
    const recommendations: string[] = [];

    if (session.interruptions > 2) {
      recommendations.push('Try enabling Do Not Disturb to reduce interruptions');
    }

    if (session.pauses > 3) {
      recommendations.push('Consider shorter sessions if you need frequent breaks');
    }

    if (focusMetrics.overallScore < 70) {
      recommendations.push('Try the "Preparation" phase to set clear goals before starting');
    }

    if (session.completionPercentage < 100) {
      recommendations.push('Build consistency by completing full sessions');
    }

    return {
      efficiency: Math.round(efficiency),
      focusRating,
      productivity,
      recommendations,
    };
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createCompletionEngine(scoringEngine: ScoringEngine): CompletionEngine {
  return new CompletionEngine(scoringEngine);
}
