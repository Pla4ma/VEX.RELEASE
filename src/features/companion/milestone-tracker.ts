/**
 * Companion Milestone Tracker
 *
 * Handles milestone detection and emission for companion growth.
 */

import { CompanionState } from './types';
import { emitCompanionMilestone } from './events';
import { trackCompanionMilestone } from './analytics';

/**
 * Check and emit milestone events
 */
export function checkMilestones(
  state: CompanionState,
  userId: string,
  previousLevel: number,
  previousSessionCount: number,
  previousFocusMinutes: number,
  previousPerfectSessions: number,
): void {
  // Level milestone
  if (state.level > previousLevel) {
    emitCompanionMilestone(
      userId,
      state.id,
      'level',
      state.level,
      previousLevel,
    );
    trackCompanionMilestone(userId, 'level', state.level, previousLevel);
  }

  // Session milestone (every 10 sessions)
  if (
    state.sessionCount > previousSessionCount &&
    state.sessionCount % 10 === 0
  ) {
    emitCompanionMilestone(
      userId,
      state.id,
      'sessions',
      state.sessionCount,
      previousSessionCount,
    );
    trackCompanionMilestone(
      userId,
      'sessions',
      state.sessionCount,
      previousSessionCount,
    );
  }

  // Focus minutes milestone (every 100 minutes)
  if (
    state.totalFocusMinutes > previousFocusMinutes &&
    state.totalFocusMinutes % 100 === 0
  ) {
    emitCompanionMilestone(
      userId,
      state.id,
      'focus_minutes',
      state.totalFocusMinutes,
      previousFocusMinutes,
    );
    trackCompanionMilestone(
      userId,
      'focus_minutes',
      state.totalFocusMinutes,
      previousFocusMinutes,
    );
  }

  // Perfect sessions milestone (every 5 perfect sessions)
  if (
    state.perfectSessions > previousPerfectSessions &&
    state.perfectSessions % 5 === 0
  ) {
    emitCompanionMilestone(
      userId,
      state.id,
      'perfect_sessions',
      state.perfectSessions,
      previousPerfectSessions,
    );
    trackCompanionMilestone(
      userId,
      'perfect_sessions',
      state.perfectSessions,
      previousPerfectSessions,
    );
  }
}
