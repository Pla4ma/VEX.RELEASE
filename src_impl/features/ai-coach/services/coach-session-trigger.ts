/**
 * Coach Session Trigger Service
 *
 * Phase 9.4 — Coach-triggered session start with pre-filled config
 * Handles CTA clicks from coach messages that create pre-configured sessions
 */

import { eventBus } from "../../../events";
import { capture } from "@/shared/analytics";
import { CoachEvents } from "@/shared/analytics/analytics-events";
import { getPersonalizedContext } from "./coach-memory";
import { createDebugger } from "../../../utils/debug";

const debug = createDebugger("ai-coach:session-trigger");

// ============================================================================
// Types
// ============================================================================

export interface CoachSessionConfig {
  duration: number;
  difficulty: "EASY" | "NORMAL" | "CHALLENGING" | "PUSH";
  sessionType: "FOCUS" | "BOSS_BATTLE" | "CHALLENGE" | "FREE";
  source: "COACH_RECOMMENDATION" | "STREAK_PROTECTION" | "COMEBACK_BUILDER" | "OPTIMAL_TIME";
  context: {
    coachReasoning: string;
    userStreakDays?: number;
    isStreakAtRisk?: boolean;
    isComebackMode?: boolean;
    optimalTimeWindow?: boolean;
  };
}

export interface SessionTriggerResult {
  success: boolean;
  sessionId?: string;
  config: CoachSessionConfig;
  error?: string;
}

function toAnalyticsDifficulty(difficulty: CoachSessionConfig["difficulty"]): "easy" | "medium" | "hard" {
  if (difficulty === "EASY") {
    return "easy";
  }
  if (difficulty === "PUSH" || difficulty === "CHALLENGING") {
    return "hard";
  }
  return "medium";
}

function toAnalyticsSessionType(sessionType: CoachSessionConfig["sessionType"]): "focus" | "challenge" | "boss" {
  if (sessionType === "CHALLENGE") {
    return "challenge";
  }
  if (sessionType === "BOSS_BATTLE") {
    return "boss";
  }
  return "focus";
}

// ============================================================================
// Configuration Presets
// ============================================================================

/**
 * Get session config for streak protection
 * Triggered when streak is at risk
 */
export function getStreakProtectionConfig(userId: string): CoachSessionConfig {
  const context = getPersonalizedContext(userId);
  const preferredDuration = (context.preferredDuration as number) || 25;

  return {
    duration: Math.min(preferredDuration, 20), // Shorter to reduce friction
    difficulty: "EASY",
    sessionType: "FOCUS",
    source: "STREAK_PROTECTION",
    context: {
      coachReasoning: `Quick ${Math.min(preferredDuration, 20)}-minute session to protect your streak. Based on your history, you can absolutely do this.`,
      userStreakDays: context.personalBestStreak as number,
      isStreakAtRisk: true,
    },
  };
}

/**
 * One-tap session start for streak at risk (Phase 6.4)
 * Pre-configured 15-minute LIGHT_FOCUS session with no setup screen
 * Called when user taps "Start My Session" from Streak Risk intervention banner
 */
export async function startStreakAtRiskSession(userId: string, hoursRemaining: number): Promise<SessionTriggerResult> {
  try {
    // Track the urgent intervention
    capture(CoachEvents.COACH_CTA_CLICKED, {
      cta_type: "streak_at_risk_start",
      urgency_hours: hoursRemaining,
      source: "STREAK_PROTECTION",
    });

    // Pre-configured session: 15 min, LIGHT_FOCUS, no strict mode
    const config: CoachSessionConfig = {
      duration: 15,
      difficulty: "EASY",
      sessionType: "FOCUS",
      source: "STREAK_PROTECTION",
      context: {
        coachReasoning: hoursRemaining < 4 ? `Quick 15-minute session to save your streak — only ${hoursRemaining} hours left!` : "15 minutes to protect your streak. You got this!",
        userStreakDays: 0, // Will be populated from actual streak data
        isStreakAtRisk: true,
      },
    };

    // Generate session ID
    const sessionId = `streak-save-${Date.now()}`;

    // Emit event to immediately start session (no setup screen)
    eventBus.publish("coach:streak_at_risk_session", {
      userId,
      sessionId,
      config,
      skipSetup: true, // Key: bypasses SessionSetupScreen
      mode: "LIGHT_FOCUS", // Light focus mode for easier completion
      strictMode: false, // No strict mode to reduce friction
    });

    // Track success
    capture("session_configured", {
      source: "streak_at_risk_cta",
      duration: 15,
      difficulty: "easy",
      session_type: "focus",
      urgency_hours: hoursRemaining,
    });

    debug.info("[Phase 6.4] Streak at risk session triggered for user %s, %s hours remaining", userId, hoursRemaining);

    return {
      success: true,
      sessionId,
      config,
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    debug.error("[Phase 6.4] Failed to trigger streak at risk session", err);

    return {
      success: false,
      config: {
        duration: 15,
        difficulty: "EASY",
        sessionType: "FOCUS",
        source: "STREAK_PROTECTION",
        context: {
          coachReasoning: "Emergency streak protection session",
          isStreakAtRisk: true,
        },
      },
      error: err.message,
    };
  }
}

/**
 * Get session config for comeback mode
 * Triggered when user is rebuilding after a break
 */
export function getComebackBuilderConfig(userId: string): CoachSessionConfig {
  const context = getPersonalizedContext(userId);
  const comebackCount = (context.comebackCount as number) || 0;

  return {
    duration: 25,
    difficulty: "NORMAL",
    sessionType: "FOCUS",
    source: "COMEBACK_BUILDER",
    context: {
      coachReasoning: comebackCount > 0 ? `Comeback #${comebackCount + 1} starts now. 25 minutes to rebuild momentum.` : "Fresh start time. 25 minutes to begin your new streak. You've got this!",
      isComebackMode: true,
    },
  };
}

/**
 * Get session config for optimal time window
 * Triggered when coach detects user's most productive time
 */
export function getOptimalTimeConfig(userId: string): CoachSessionConfig {
  const context = getPersonalizedContext(userId);
  const productiveTime = context.productiveTimeOfDay as string;
  const preferredDuration = (context.preferredDuration as number) || 25;

  return {
    duration: preferredDuration,
    difficulty: "CHALLENGING",
    sessionType: "FOCUS",
    source: "OPTIMAL_TIME",
    context: {
      coachReasoning: productiveTime ? `It's your power time (${productiveTime})! A ${preferredDuration}-minute session now will be incredibly productive.` : `Your optimal focus window is open! Based on your patterns, a ${preferredDuration}-minute session would be perfect right now.`,
      optimalTimeWindow: true,
    },
  };
}

/**
 * Get session config based on coach's current recommendation
 */
export function getCoachRecommendedConfig(
  userId: string,
  recommendation: {
    duration: number;
    difficulty: string;
    reasoning: string;
  },
): CoachSessionConfig {
  return {
    duration: recommendation.duration,
    difficulty: recommendation.difficulty as CoachSessionConfig["difficulty"],
    sessionType: "FOCUS",
    source: "COACH_RECOMMENDATION",
    context: {
      coachReasoning: recommendation.reasoning,
    },
  };
}

// ============================================================================
// Main Trigger Function
// ============================================================================

/**
 * Trigger a coach-recommended session
 * This creates a pre-configured session and emits the appropriate events
 */
export async function triggerCoachSession(userId: string, config: CoachSessionConfig): Promise<SessionTriggerResult> {
  try {
    // Track the CTA click
    capture(CoachEvents.COACH_CTA_CLICKED, {
      cta_type: "start_session",
      session_duration: config.duration,
      difficulty: toAnalyticsDifficulty(config.difficulty),
      source: config.source,
    });

    // Validate config
    if (config.duration < 5 || config.duration > 180) {
      throw new Error("Invalid session duration");
    }

    // Generate session ID
    const sessionId = `coach-session-${Date.now()}`;

    // Emit event to start session
    eventBus.publish("coach:session_triggered", {
      userId,
      sessionId,
      config,
    });

    // Track session start success
    capture("session_configured", {
      source: "coach_cta",
      duration: config.duration,
      difficulty: toAnalyticsDifficulty(config.difficulty),
      session_type: toAnalyticsSessionType(config.sessionType),
    });

    return {
      success: true,
      sessionId,
      config,
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    debug.error("Failed to trigger coach session", err);

    return {
      success: false,
      config,
      error: err.message,
    };
  }
}

/**
 * Handle coach message CTA click
 * This is the main entry point when user clicks "Start Session" from a coach message
 */
export async function handleCoachCta(userId: string, ctaType: "start_session" | "view_streak" | "view_progress", ctaData?: Record<string, unknown>): Promise<void> {
  switch (ctaType) {
    case "start_session":
      if (ctaData?.duration) {
        const config: CoachSessionConfig = {
          duration: ctaData.duration as number,
          difficulty: (ctaData.difficulty as CoachSessionConfig["difficulty"]) || "NORMAL",
          sessionType: "FOCUS",
          source: "COACH_RECOMMENDATION",
          context: {
            coachReasoning: (ctaData.reasoning as string) || "Coach recommended session",
          },
        };
        await triggerCoachSession(userId, config);
      }
      break;

    case "view_streak":
      // Navigate to streak screen
      eventBus.publish("navigation:navigate", {
        screen: "Streak",
      });
      break;

    case "view_progress":
      // Navigate to progress screen
      eventBus.publish("navigation:navigate", {
        screen: "Progress",
      });
      break;

    default:
      debug.warn("Unknown CTA type: %s", ctaType);
  }
}

// ============================================================================
// Analytics Helper
// ============================================================================

/**
 * Track coach CTA effectiveness
 * Should be called after session completion to measure conversion
 */
export function trackCoachCtaEffectiveness(sessionId: string, config: CoachSessionConfig, sessionCompleted: boolean, sessionQuality?: number): void {
  capture("coach_cta_effectiveness", {
    session_id: sessionId,
    source: config.source,
    duration: config.duration,
    difficulty: toAnalyticsDifficulty(config.difficulty),
    session_completed: sessionCompleted,
    session_quality: sessionQuality,
    conversion_rate: sessionCompleted ? 1 : 0,
  });
}

/**
 * Get coach CTA analytics for a user
 * Returns stats on how effective coach CTAs are for this user
 */
export function getCoachCtaStats(userId: string): {
  totalCtAsClicked: number;
  sessionsStarted: number;
  sessionsCompleted: number;
  conversionRate: number;
} {
  // In production, this would query analytics
  // For now, return placeholder stats
  return {
    totalCtAsClicked: 0,
    sessionsStarted: 0,
    sessionsCompleted: 0,
    conversionRate: 0,
  };
}
