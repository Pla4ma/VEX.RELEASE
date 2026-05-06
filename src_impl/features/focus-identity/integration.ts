/**
 * Focus Identity Integration
 *
 * Integrates Focus Identity Protocol with other systems:
 * - Session system (updates score on session completion)
 * - Progression system (XP multipliers based on score)
 * - Notification system (streak risk alerts)
 * - Analytics system (comprehensive tracking)
 */

import { eventBus } from "../../events";
import * as Sentry from "@sentry/react-native";
import { FocusIdentityService } from "./FocusIdentityEngine";
import * as analytics from "./analytics";
import { spectacleService } from "../spectacle";
import { SpectacleType } from "../spectacle/types";
import { getMonthlyReportData } from "./repository";

function readSummaryMetric(summary: DynamicValue, key: string): DynamicValue {
  return summary && typeof summary === "object" ? Reflect.get(summary, key) : undefined;
}

// ============================================================================
// SESSION INTEGRATION
// ============================================================================

/**
 * Subscribe to session events and update Focus Score
 */
export function initializeSessionIntegration(): () => void {
  const unsubscribeCompleted = eventBus.subscribe("session:completed", async (event) => {
    const { userId, summary } = event;
    if (!userId) {
      return;
    }

    const service = new FocusIdentityService(userId);
    const profile = await service.getProfile();
    if (!profile) {
      return;
    }

    // Determine event type based on session quality
    let eventType: "SESSION_COMPLETE" | "PERFECT_SESSION" = "SESSION_COMPLETE";

    const focusPurity = readSummaryMetric(summary, "focusPurity");
    const grade = readSummaryMetric(summary, "grade");
    if (typeof focusPurity === "number" && focusPurity >= 95 && grade === "S") {
      eventType = "PERFECT_SESSION";
    }

    // Update score
    const result = await service.updateScore(eventType, {
      streakLength: profile.factors.streakStability.currentStreak,
      grade: typeof grade === "string" ? grade : undefined,
    });

    // Track analytics
    analytics.trackFocusScoreUpdated(userId, profile.currentScore, result.newScore, result.change, profile.band.label, eventType, profile.isInRecovery);

    // Publish focus score event for other systems
    eventBus.publish("FOCUS_SCORE_UPDATED", {
      userId,
      previousScore: profile.currentScore,
      newScore: result.newScore,
      change: result.change,
      band: profile.band.label,
      isInRecovery: profile.isInRecovery,
    });

    // Check if this is the first session of a new month
    // If so, trigger the monthly report spectacle
    await maybeTriggerMonthlyReport(userId, profile);
  });

  const unsubscribeAbandoned = eventBus.subscribe("session:abandoned", async (event) => {
    const { userId } = event;
    if (!userId) {
      return;
    }

    const service = new FocusIdentityService(userId);
    const profile = await service.getProfile();
    if (!profile) {
      return;
    }

    // Score penalty for abandoning
    const result = await service.updateScore("SESSION_ABANDON", {});

    analytics.trackFocusScoreUpdated(userId, profile.currentScore, result.newScore, result.change, profile.band.label, "SESSION_ABANDON", profile.isInRecovery);
  });

  const unsubscribeStreakBroken = eventBus.subscribe("streak:broken", async (event) => {
    const { userId } = event;
    if (!userId) {
      return;
    }

    const service = new FocusIdentityService(userId);
    const profile = await service.getProfile();
    if (!profile) {
      return;
    }

    // Major penalty for streak break
    const result = await service.updateScore("STREAK_BREAK", {});

    // Track recovery start
    analytics.trackRecoveryStarted(userId, profile.currentScore, "streak_broken");

    analytics.trackFocusScoreUpdated(
      userId,
      profile.currentScore,
      result.newScore,
      result.change,
      profile.band.label,
      "STREAK_BREAK",
      true, // Now in recovery
    );
  });

  // Return cleanup function
  return () => {
    unsubscribeCompleted();
    unsubscribeAbandoned();
    unsubscribeStreakBroken();
  };
}

// ============================================================================
// PROGRESSION INTEGRATION
// ============================================================================

/**
 * Get XP multiplier based on Focus Score
 */
export function getXpMultiplierForScore(score: number): number {
  if (score >= 800) {
    return 2.0;
  } // Legendary: 2x XP
  if (score >= 740) {
    return 1.75;
  } // Elite: 1.75x
  if (score >= 670) {
    return 1.5;
  } // Exceptional: 1.5x
  if (score >= 580) {
    return 1.25;
  } // Strong: 1.25x
  if (score >= 500) {
    return 1.0;
  } // Good: 1x
  if (score >= 420) {
    return 0.9;
  } // Fair: 0.9x
  return 0.8; // Building: 0.8x
}

/**
 * Subscribe to focus score updates for progression bonuses
 */
export function initializeProgressionIntegration(): () => void {
  const unsubscribe = eventBus.subscribe("FOCUS_SCORE_UPDATED", (event) => {
    const { userId, newScore, band } = event;

    // Calculate XP multiplier
    const multiplier = getXpMultiplierForScore(newScore);

    // Publish XP multiplier for progression system
    eventBus.publish("FOCUS_XP_MULTIPLIER_UPDATED", {
      userId,
      multiplier,
      score: newScore,
      band,
    });

    // Track if user achieved new band
    analytics.trackScoreEngagement(userId, "weekly_review");
  });

  return unsubscribe;
}

// ============================================================================
// NOTIFICATION INTEGRATION
// ============================================================================

/**
 * Check if user needs retention intervention
 */
export async function checkRetentionRisk(userId: string): Promise<{
  atRisk: boolean;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  reason: string;
}> {
  const service = new FocusIdentityService(userId);
  const profile = await service.getProfile();

  if (!profile) {
    return { atRisk: true, riskLevel: "HIGH", reason: "no_profile" };
  }

  // Check factors
  const daysSinceLastSession = profile.factors.recency.daysSinceLastSession;
  const scoreTrend = profile.factors.recency.trendDirection;

  if (daysSinceLastSession >= 7) {
    analytics.trackChurnRiskIdentified(userId, profile.currentScore, daysSinceLastSession, "CRITICAL");
    return { atRisk: true, riskLevel: "CRITICAL", reason: "7_days_inactive" };
  }

  if (daysSinceLastSession >= 3) {
    analytics.trackChurnRiskIdentified(userId, profile.currentScore, daysSinceLastSession, "HIGH");
    return { atRisk: true, riskLevel: "HIGH", reason: "3_days_inactive" };
  }

  if (scoreTrend === "CONCERNING") {
    analytics.trackChurnRiskIdentified(userId, profile.currentScore, daysSinceLastSession, "MEDIUM");
    return { atRisk: true, riskLevel: "MEDIUM", reason: "declining_score" };
  }

  return { atRisk: false, riskLevel: "LOW", reason: "healthy" };
}

// ============================================================================
// ONBOARDING INTEGRATION
// ============================================================================

/**
 * Initialize Focus Identity for new users during onboarding
 */
export async function initializeForNewUser(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const service = new FocusIdentityService(userId);
    const profile = await service.initializeProfile();

    analytics.trackFocusIdentityCreated(userId, profile.currentScore, profile.band.label);
    analytics.trackFocusIdentityFunnel(userId, "profile_created", profile.band.label);

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    analytics.trackFocusIdentityError(userId, "onboarding_init_failed", errorMessage, {});
    return { success: false, error: errorMessage };
  }
}

// ============================================================================
// MONTHLY REPORT TRIGGER
// ============================================================================

/**
 * Check if this is the first session of a new month and trigger monthly report
 */
async function maybeTriggerMonthlyReport(userId: string, profile: DynamicValue): Promise<void> {
  try {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    // Check if we have a monthly report for this month
    const report = await getMonthlyReportData(userId, currentMonth);

    // If no report exists for this month, this is the first session
    if (!report) {
      // Get previous month's report for comparison
      const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
      const prevReport = await getMonthlyReportData(userId, prevMonth);

      // Trigger the monthly report spectacle
      spectacleService.triggerSpectacle(SpectacleType.MONTHLY_REPORT, {
        userId,
        timestamp: Date.now(),
        month: currentMonth,
        startingScore: prevReport?.endingScore ?? profile.currentScore,
        endingScore: profile.currentScore,
        change: prevReport ? profile.currentScore - prevReport.endingScore : 0,
        sessionsCompleted: 1, // First session of month
        grade: "A", // Will be updated at end of month
        highlight: "First session of the month! Building momentum.",
      });
    }
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: "focus-identity", operation: "trigger-monthly-report" },
    });
  }
}

// ============================================================================
// COMPREHENSIVE INITIALIZATION
// ============================================================================

export function initializeFocusIdentityIntegrations(): {
  cleanup: () => void;
} {
  const cleanupSession = initializeSessionIntegration();
  const cleanupProgression = initializeProgressionIntegration();

  return {
    cleanup: () => {
      cleanupSession();
      cleanupProgression();
    },
  };
}
