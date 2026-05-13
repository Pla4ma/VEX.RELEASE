import { eventBus } from "../../../events";
import { capture } from "@/shared/analytics";
import { CoachEvents } from "@/shared/analytics/analytics-events";
import { getPersonalizedContext } from "./coach-memory";
import { createDebugger } from "../../../utils/debug";


export async function handleCoachCta(userId: string, ctaType: 'start_session' | 'view_streak' | 'view_progress', ctaData?: Record<string, unknown>): Promise<void> {
  switch (ctaType) {
    case 'start_session':
      if (ctaData?.duration) {
        const config: CoachSessionConfig = {
          duration: ctaData.duration as number,
          difficulty: (ctaData.difficulty as CoachSessionConfig['difficulty']) || 'NORMAL',
          sessionType: 'FOCUS',
          source: 'COACH_RECOMMENDATION',
          context: {
            coachReasoning: (ctaData.reasoning as string) || 'Coach recommended session',
          },
        };
        await triggerCoachSession(userId, config);
      }
      break;

    case 'view_streak':
      // Navigate to streak screen
      eventBus.publish('navigation:navigate', {
        screen: 'Streak',
      });
      break;

    case 'view_progress':
      // Navigate to progress screen
      eventBus.publish('navigation:navigate', {
        screen: 'Progress',
      });
      break;

    default:
      debug.warn('Unknown CTA type: %s', ctaType);
  }
}

export function trackCoachCtaEffectiveness(sessionId: string, config: CoachSessionConfig, sessionCompleted: boolean, sessionQuality?: number): void {
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
  // In production, this would query analytics
  // For now, return placeholder stats
  return {
    totalCtAsClicked: 0,
    sessionsStarted: 0,
    sessionsCompleted: 0,
    conversionRate: 0,
  };
}