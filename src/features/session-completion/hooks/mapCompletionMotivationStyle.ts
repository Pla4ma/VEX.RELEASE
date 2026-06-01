import type { CoachPresenceMotivationStyle } from '../../coach-presence';

export function mapCompletionMotivationStyle(
  input: string | undefined,
): CoachPresenceMotivationStyle {
  if (input === 'student') {
    return 'STUDY_FOCUSED';
  }
  if (input === 'friendly') {
    return 'FRIENDLY';
  }
  if (input === 'game_like' || input === 'competitive') {
    return 'GAME_LIKE';
  }
  if (input === 'coach_led') {
    return 'COACH_LED';
  }
  if (input === 'intense') {
    return 'INTENSE';
  }
  return 'CALM';
}
