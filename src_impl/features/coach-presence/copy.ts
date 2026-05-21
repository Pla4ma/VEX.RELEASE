import type {
  CoachActionIntent,
  CoachPresenceMotivationStyle,
  CompletionPresenceSummary,
} from './schemas';

export const BANNED_COACH_PHRASES = [
  'Great job',
  'Keep going',
  'You can do it',
  'Boost productivity',
  'Unlock your potential',
] as const;

export const ACTION_LABELS: Record<CoachActionIntent, string> = {
  CONTINUE_PLAN: 'Continue plan',
  REFLECT: 'Reflect now',
  REVIEW_PROGRESS: 'Review progress',
  START_SESSION: 'Start focus',
  START_STUDY_SESSION: 'Start study',
  TAKE_BREAK: 'Take a break',
};

export const STYLE_ADAPTATION: Record<CoachPresenceMotivationStyle, string> = {
  CALM: 'Low pressure, clear next step.',
  COACH_LED: 'Direct guidance without extra talk.',
  GAME_LIKE: 'Progress framed as a clean move.',
  INTENSE: 'Sharper language, still controlled.',
  STUDY_FOCUSED: 'Study context stays in front.',
};

export const FALLBACK_HOME_MESSAGES: Record<CoachPresenceMotivationStyle, string> = {
  CALM: 'Your rhythm is warm. One clean block next.',
  COACH_LED: 'Next rep is clear. Start the block.',
  GAME_LIKE: 'Your streak has a lane. Bank the next block.',
  INTENSE: 'Window is open. Take the block now.',
  STUDY_FOCUSED: 'Your study block is ready. Start there.',
};

export const PROGRESS_REACTIONS: Record<CoachPresenceMotivationStyle, string> = {
  CALM: 'The pattern is becoming easier to return to.',
  COACH_LED: 'The last finish gives us the next cue.',
  GAME_LIKE: 'The run has momentum. Spend it well.',
  INTENSE: 'Momentum is live. Do not drift.',
  STUDY_FOCUSED: 'The study thread is still fresh.',
};

export function getCompletionMessage(
  style: CoachPresenceMotivationStyle,
  summary: CompletionPresenceSummary,
): string {
  if (summary.isFirstSession) {
    return style === 'STUDY_FOCUSED'
      ? 'First study proof is in. Set the next block.'
      : 'First session is real now. Choose the next block.';
  }
  if (summary.isComeback) {
    return 'That return counted. Keep the next block small.';
  }
  if (summary.isStreakRecovery) {
    return 'The chain is breathing again. Protect it next.';
  }
  if (summary.isHighFocusStreak) {
    return 'High-focus rhythm is showing. Use it once more.';
  }
  if (summary.isLowEnergyDay) {
    return 'Low-energy day, still banked. Recover with care.';
  }
  if (summary.sessionMode === 'STUDY') {
    return 'Study thread stayed alive. Queue the next pass.';
  }
  if (summary.durationMinutes < 15) {
    return 'Short block landed. Stack one more easy rep.';
  }
  if (summary.durationMinutes >= 45) {
    return 'Long block held. Let the next move be lighter.';
  }
  return 'Session banked. Home has the next move.';
}
