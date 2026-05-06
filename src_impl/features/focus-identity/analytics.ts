/**
 * Focus Identity Analytics
 *
 * Comprehensive analytics tracking for the Focus Identity Protocol.
 * Tracks user engagement, score changes, and retention metrics.
 */

import { capture } from "../../shared/analytics/analytics-service";
import type { FocusIdentityProfile } from "./FocusIdentityEngine";

// ============================================================================
// EVENT TRACKING
// ============================================================================

export function trackFocusIdentityCreated(userId: string, initialScore: number, band: string): void {
  capture("focus_identity_created", {
    user_id: userId,
    initial_score: initialScore,
    initial_band: band,
    source: "onboarding",
  });
}

export function trackFocusScoreUpdated(userId: string, previousScore: number, newScore: number, change: number, band: string, reason: string, isInRecovery: boolean): void {
  capture("focus_score_updated", {
    user_id: userId,
    previous_score: previousScore,
    new_score: newScore,
    delta: change,
    band,
    reason,
    is_in_recovery: isInRecovery,
  });

  // Track significant changes
  if (Math.abs(change) >= 20) {
    capture("focus_score_significant_change", {
      user_id: userId,
      change_magnitude: change > 0 ? "positive_large" : "negative_large",
      change_amount: Math.abs(change),
      band,
    });
  }
}

export function trackScoreBandChange(userId: string, oldBand: string, newBand: string, newScore: number): void {
  capture("focus_score_band_change", {
    user_id: userId,
    previous_band: oldBand,
    new_band: newBand,
    new_score: newScore,
    direction: newScore > 500 ? "upward" : "downward",
  });
}

export function trackRecoveryStarted(userId: string, preLapseScore: number, trigger: string): void {
  capture("focus_recovery_started", {
    user_id: userId,
    pre_lapse_score: preLapseScore,
    recovery_trigger: trigger,
  });
}

export function trackRecoveryCompleted(userId: string, finalScore: number, daysInRecovery: number): void {
  capture("focus_recovery_completed", {
    user_id: userId,
    final_score: finalScore,
    days_in_recovery: daysInRecovery,
  });
}

export function trackMonthlyReportViewed(userId: string, month: string, grade: string, scoreChange: number): void {
  capture("focus_monthly_report_viewed", {
    user_id: userId,
    report_month: month,
    report_grade: grade,
    score_change: scoreChange,
  });
}

export function trackFocusScoreShared(userId: string, score: number, band: string, platform: string): void {
  capture("focus_score_shared", {
    user_id: userId,
    score,
    band,
    share_platform: platform,
  });
}

// ============================================================================
// ENGAGEMENT METRICS
// ============================================================================

export function trackScoreCardViewed(userId: string, score: number, timeSinceLastView: number): void {
  capture("focus_score_card_viewed", {
    user_id: userId,
    current_score: score,
    time_since_last_view_ms: timeSinceLastView,
  });
}

export function trackScoreHistoryViewed(userId: string, daysViewed: number): void {
  capture("focus_score_history_viewed", {
    user_id: userId,
    days_viewed: daysViewed,
  });
}

export function trackRecommendationClicked(userId: string, recommendation: string, factor: string): void {
  capture("focus_recommendation_clicked", {
    user_id: userId,
    recommendation_text: recommendation,
    target_factor: factor,
  });
}

// ============================================================================
// RETENTION METRICS
// ============================================================================

export function trackChurnRiskIdentified(userId: string, score: number, daysSinceLastSession: number, riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"): void {
  capture("focus_churn_risk_identified", {
    user_id: userId,
    current_score: score,
    days_since_session: daysSinceLastSession,
    risk_level: riskLevel,
  });
}

export function trackScoreEngagement(userId: string, engagementType: "daily_check" | "weekly_review" | "monthly_deep_dive"): void {
  capture("focus_score_engagement", {
    user_id: userId,
    engagement_type: engagementType,
  });
}

// ============================================================================
// FACTOR-SPECIFIC ANALYTICS
// ============================================================================

export function trackFactorImprovement(userId: string, factor: string, oldScore: number, newScore: number): void {
  capture("focus_factor_improved", {
    user_id: userId,
    factor_name: factor,
    previous_factor_score: oldScore,
    new_factor_score: newScore,
    improvement: newScore - oldScore,
  });
}

// ============================================================================
// USER PROPERTIES
// ============================================================================

export function setFocusIdentityUserProperties(userId: string, profile: FocusIdentityProfile): void {
  capture("focus_identity_user_properties_set", {
    user_id: userId,
    focus_score: profile.currentScore,
    focus_band: profile.band.label,
    focus_percentile: profile.percentileRank,
    focus_streak_in_band: profile.streakInCurrentBand,
    focus_is_in_recovery: profile.isInRecovery,
    focus_top_strength: profile.topStrength,
    focus_top_weakness: profile.topWeakness,
    focus_days_active: Math.floor((Date.now() - new Date(profile.firstScoreDate).getTime()) / (1000 * 60 * 60 * 24)),
  });
}

// ============================================================================
// FUNNEL ANALYTICS
// ============================================================================

export function trackFocusIdentityFunnel(userId: string, step: "profile_created" | "first_score_calculated" | "band_achieved" | "report_viewed" | "shared", band?: string): void {
  capture("focus_identity_funnel", {
    user_id: userId,
    funnel_step: step,
    current_band: band,
  });
}

// ============================================================================
// ERROR TRACKING
// ============================================================================

export function trackFocusIdentityError(userId: string, errorType: string, errorMessage: string, context: Record<string, unknown>): void {
  capture("focus_identity_error", {
    user_id: userId,
    error_type: errorType,
    error_message: errorMessage,
    error_context: context,
  });
}
