/**
 * Mastery Analytics
 *
 * Analytics tracking for skill expression and perfect sessions.
 */

import * as Sentry from '@sentry/react-native';

/**
 * Hash user ID for privacy in analytics
 */
function hashUserId(userId: string): string {
  // Simple hash for privacy - in production, use a proper hashing algorithm
  return userId.slice(0, 4) + '...' + userId.slice(-4);
}

/**
 * Track when a perfect session is completed
 */
export function trackPerfectSession(
  userId: string,
  sessionId: string,
  duration: number,
  score: number
): void {
  Sentry.addBreadcrumb({
    category: 'mastery.perfect_session',
    message: 'Perfect session completed',
    level: 'info',
    data: {
      userId: hashUserId(userId),
      sessionId,
      durationMinutes: Math.floor(duration / 60),
      score,
    },
  });
}

/**
 * Track S-grade streak milestones
 */
export function trackSGradeStreakMilestone(
  userId: string,
  streakCount: number,
  milestone: 3 | 5 | 10
): void {
  Sentry.addBreadcrumb({
    category: 'mastery.s_grade_streak',
    message: `S-grade streak milestone: ${milestone}`,
    level: 'info',
    data: {
      userId: hashUserId(userId),
      streakCount,
      milestone,
    },
  });
}

/**
 * Track when perfect session banner is displayed
 */
export function trackPerfectSessionBannerDisplayed(
  userId: string,
  sessionId: string
): void {
  Sentry.addBreadcrumb({
    category: 'mastery.perfect_session_banner',
    message: 'Perfect session banner displayed',
    level: 'info',
    data: {
      userId: hashUserId(userId),
      sessionId,
    },
  });
}
