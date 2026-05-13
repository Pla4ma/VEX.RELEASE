import { eventBus } from "../../../events";
import { capture } from "@/shared/analytics";
import { CoachEvents } from "@/shared/analytics/analytics-events";
import { getPersonalizedContext } from "./coach-memory";
import { createDebugger } from "../../../utils/debug";


export function getStreakProtectionConfig(userId: string): CoachSessionConfig {
  const context = getPersonalizedContext(userId);
  const preferredDuration = (context.preferredDuration as number) || 25;

  return {
    duration: Math.min(preferredDuration, 20), // Shorter to reduce friction
    difficulty: 'EASY',
    sessionType: 'FOCUS',
    source: 'STREAK_PROTECTION',
    context: {
      coachReasoning: `Quick ${Math.min(preferredDuration, 20)}-minute session to protect your streak. Based on your history, you can absolutely do this.`,
      userStreakDays: context.personalBestStreak as number,
      isStreakAtRisk: true,
    },
  };
}

export async function startStreakAtRiskSession(userId: string, hoursRemaining: number): Promise<SessionTriggerResult> {
  try {
    // Track the urgent intervention
    capture(CoachEvents.COACH_CTA_CLICKED, {
      cta_type: 'streak_at_risk_start',
      urgency_hours: hoursRemaining,
      source: 'STREAK_PROTECTION',
    });

    // Pre-configured session: 15 min, LIGHT_FOCUS, no strict mode
    const config: CoachSessionConfig = {
      duration: 15,
      difficulty: 'EASY',
      sessionType: 'FOCUS',
      source: 'STREAK_PROTECTION',
      context: {
        coachReasoning: hoursRemaining < 4 ? `Quick 15-minute session to save your streak — only ${hoursRemaining} hours left!` : '15 minutes to protect your streak. You got this!',
        userStreakDays: 0, // Will be populated from actual streak data
        isStreakAtRisk: true,
      },
    };

    // Generate session ID
    const sessionId = `streak-save-${Date.now()}`;

    // Emit event to immediately start session (no setup screen)
    eventBus.publish('coach:streak_at_risk_session', {
      userId,
      sessionId,
      config,
      skipSetup: true, // Key: bypasses SessionSetupScreen
      mode: 'LIGHT_FOCUS', // Light focus mode for easier completion
      strictMode: false, // No strict mode to reduce friction
    });

    // Track success
    capture('session_configured', {
      source: 'streak_at_risk_cta',
      duration: 15,
      difficulty: 'easy',
      session_type: 'focus',
      urgency_hours: hoursRemaining,
    });

    debug.info('[Phase 6.4] Streak at risk session triggered for user %s, %s hours remaining', userId, hoursRemaining);

    return {
      success: true,
      sessionId,
      config,
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    debug.error('[Phase 6.4] Failed to trigger streak at risk session', err);

    return {
      success: false,
      config: {
        duration: 15,
        difficulty: 'EASY',
        sessionType: 'FOCUS',
        source: 'STREAK_PROTECTION',
        context: {
          coachReasoning: 'Emergency streak protection session',
          isStreakAtRisk: true,
        },
      },
      error: err.message,
    };
  }
}

export function getComebackBuilderConfig(userId: string): CoachSessionConfig {
  const context = getPersonalizedContext(userId);
  const comebackCount = (context.comebackCount as number) || 0;

  return {
    duration: 25,
    difficulty: 'NORMAL',
    sessionType: 'FOCUS',
    source: 'COMEBACK_BUILDER',
    context: {
      coachReasoning: comebackCount > 0 ? `Comeback #${comebackCount + 1} starts now. 25 minutes to rebuild momentum.` : "Fresh start time. 25 minutes to begin your new streak. You've got this!",
      isComebackMode: true,
    },
  };
}

export function getOptimalTimeConfig(userId: string): CoachSessionConfig {
  const context = getPersonalizedContext(userId);
  const productiveTime = context.productiveTimeOfDay as string;
  const preferredDuration = (context.preferredDuration as number) || 25;

  return {
    duration: preferredDuration,
    difficulty: 'CHALLENGING',
    sessionType: 'FOCUS',
    source: 'OPTIMAL_TIME',
    context: {
      coachReasoning: productiveTime ? `It's your power time (${productiveTime})! A ${preferredDuration}-minute session now will be incredibly productive.` : `Your optimal focus window is open! Based on your patterns, a ${preferredDuration}-minute session would be perfect right now.`,
      optimalTimeWindow: true,
    },
  };
}

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
    difficulty: recommendation.difficulty as CoachSessionConfig['difficulty'],
    sessionType: 'FOCUS',
    source: 'COACH_RECOMMENDATION',
    context: {
      coachReasoning: recommendation.reasoning,
    },
  };
}

export async function triggerCoachSession(userId: string, config: CoachSessionConfig): Promise<SessionTriggerResult> {
  try {
    // Track the CTA click
    capture(CoachEvents.COACH_CTA_CLICKED, {
      cta_type: 'start_session',
      session_duration: config.duration,
      difficulty: toAnalyticsDifficulty(config.difficulty),
      source: config.source,
    });

    // Validate config
    if (config.duration < 5 || config.duration > 180) {
      throw new Error('Invalid session duration');
    }

    // Generate session ID
    const sessionId = `coach-session-${Date.now()}`;

    // Emit event to start session
    eventBus.publish('coach:session_triggered', {
      userId,
      sessionId,
      config,
    });

    // Track session start success
    capture('session_configured', {
      source: 'coach_cta',
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
    debug.error('Failed to trigger coach session', err);

    return {
      success: false,
      config,
      error: err.message,
    };
  }
}