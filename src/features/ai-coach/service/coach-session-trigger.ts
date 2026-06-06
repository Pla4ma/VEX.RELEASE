import { eventBus } from '../../../events';
import { capture } from '@/shared/analytics';
import { CoachEvents } from '@/shared/analytics/analytics-events';
import { createDebugger } from '../../../utils/debug';
import type { RouteName } from '../../../types/navigation';
import type { CoachSessionConfig, SessionTriggerResult } from './coach-session-types';
import {
  toAnalyticsDifficulty,
  toAnalyticsSessionType,
} from './coach-session-types';

export type { CoachSessionConfig, SessionTriggerResult } from './coach-session-types';
export {
  toAnalyticsDifficulty,
  toAnalyticsSessionType,
} from './coach-session-types';
export {
  getStreakProtectionConfig,
  getComebackBuilderConfig,
  getOptimalTimeConfig,
  getCoachRecommendedConfig,
} from './coach-session-configs';

const debug = createDebugger('ai-coach:session-trigger');

export async function startStreakAtRiskSession(
  userId: string,
  hoursRemaining: number,
): Promise<SessionTriggerResult> {
  try {
    capture(CoachEvents.COACH_CTA_CLICKED, {
      cta_type: 'streak_at_risk_start',
      urgency_hours: hoursRemaining,
      source: 'STREAK_PROTECTION',
    });
    const config: CoachSessionConfig = {
      duration: 15,
      difficulty: 'EASY',
      sessionType: 'FOCUS',
      source: 'STREAK_PROTECTION',
      context: {
        coachReasoning:
          hoursRemaining < 4
            ? `Quick 15-minute session to save your streak — only ${hoursRemaining} hours left!`
            : '15 minutes to protect your streak. You got this!',
        userStreakDays: 0,
        isStreakAtRisk: true,
      },
    };
    const sessionId = `streak-save-${Date.now()}`;
    eventBus.publish('coach:streak_at_risk_session', {
      userId,
      sessionId,
      config,
      skipSetup: true,
      mode: 'LIGHT_FOCUS',
      strictMode: false,
    });
    capture('session_configured', {
      source: 'streak_at_risk_cta',
      duration: 15,
      difficulty: 'easy',
      session_type: 'focus',
      urgency_hours: hoursRemaining,
    });
    debug.info(
      '[Phase 6.4] Streak at risk session triggered for user %s, %s hours remaining',
      userId,
      hoursRemaining,
    );
    return { success: true, sessionId, config };
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

export async function triggerCoachSession(
  userId: string,
  config: CoachSessionConfig,
): Promise<SessionTriggerResult> {
  try {
    capture(CoachEvents.COACH_CTA_CLICKED, {
      cta_type: 'start_session',
      session_duration: config.duration,
      difficulty: toAnalyticsDifficulty(config.difficulty),
      source: config.source,
    });
    if (config.duration < 5 || config.duration > 180) {
      throw new Error('Invalid session duration');
    }
    const sessionId = `coach-session-${Date.now()}`;
    eventBus.publish('coach:session_triggered', { userId, sessionId, config });
    capture('session_configured', {
      source: 'coach_cta',
      duration: config.duration,
      difficulty: toAnalyticsDifficulty(config.difficulty),
      session_type: toAnalyticsSessionType(config.sessionType),
    });
    return { success: true, sessionId, config };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    debug.error('Failed to trigger coach session', err);
    return { success: false, config, error: err.message };
  }
}

export async function handleCoachCta(
  userId: string,
  ctaType: 'start_session' | 'view_streak' | 'view_progress',
  ctaData?: Record<string, unknown>,
): Promise<void> {
  switch (ctaType) {
    case 'start_session':
      if (ctaData?.duration) {
        const config: CoachSessionConfig = {
          duration: ctaData.duration as number,
          difficulty:
            (ctaData.difficulty as CoachSessionConfig['difficulty']) ||
            'NORMAL',
          sessionType: 'FOCUS',
          source: 'COACH_RECOMMENDATION',
          context: {
            coachReasoning:
              (ctaData.reasoning as string) || 'Coach recommended session',
          },
        };
        await triggerCoachSession(userId, config);
      }
      break;
    case 'view_streak':
      eventBus.publish('navigation:navigate', { screen: 'Streak' as RouteName });
      break;
    case 'view_progress':
      eventBus.publish('navigation:navigate', { screen: 'Progress' as RouteName });
      break;
    default:
      debug.warn('Unknown CTA type: %s', ctaType);
  }
}

export function trackCoachCtaEffectiveness(
  sessionId: string,
  config: CoachSessionConfig,
  sessionCompleted: boolean,
  sessionQuality?: number,
): void {
  capture('coach_cta_effectiveness', {
    session_id: sessionId,
    source: config.source,
    duration: config.duration,
    difficulty: toAnalyticsDifficulty(config.difficulty),
    session_completed: sessionCompleted,
    session_quality: sessionQuality,
    conversion_rate: sessionCompleted ? 1 : 0,
  });
}

export function getCoachCtaStats(userId: string): {
  totalCtAsClicked: number;
  sessionsStarted: number;
  sessionsCompleted: number;
  conversionRate: number;
} {
  return {
    totalCtAsClicked: 0,
    sessionsStarted: 0,
    sessionsCompleted: 0,
    conversionRate: 0,
  };
}
