import { z } from 'zod';

export const FallbackTierSchema = z.enum([
  'ai_success',
  'deterministic_contextual',
  'quiet_degradation',
]);

export type FallbackTier = z.infer<typeof FallbackTierSchema>;

export const FallbackResultSchema = z.object({
  tier: FallbackTierSchema,
  content: z.string(),
  showAI: z.boolean(),
  debugMessage: z.string().optional(),
});

export type FallbackResult = z.infer<typeof FallbackResultSchema>;

export const DETERMINISTIC_MESSAGES: Record<string, Record<string, string>> = {
  coach_message: {
    STREAK_RISK:
      "You're at {streak} days — a quick {duration}-min session keeps it alive.",
    SESSION_SUGGESTION:
      'Your best focus time is usually {bestTime}. Ready for a session?',
    COMEBACK_SUPPORT:
      'Welcome back! Day {day} of {total} — {remaining} more to restart your streak.',
    MILESTONE_HYPE:
      'You just hit {streak} days! That puts you in the top {percentile}% of users.',
    POST_FAILURE:
      'Last session scored {score}/100. Want a shorter session to rebuild confidence?',
    PROGRESS_REMINDER:
      'You are level {level} with {xpToNext} XP to next level.',
    MOTIVATION_BOOST:
      '{completedSessions} sessions this week — that is {percentChange}% vs last week.',
    default:
      'You have {streak}-day streak. {hoursSinceLast}h since last session.',
  },
  session_summary: {
    default:
      'You completed {sessionCount} sessions this week totaling {totalFocusMinutes} minutes. Average quality: {averageQuality}/100.',
  },
  comeback_prompt: {
    day1: 'Day 1 of your comeback. {sessionsCompleted} sessions done — keep the momentum!',
    day2: 'Day 2! {streakProgress}% progress toward restarting your streak.',
    day3: 'Final comeback day! One more session to restart your streak.',
    default:
      'Comeback in progress. {sessionsCompleted} of 3 sessions completed.',
  },
  streak_nudge: {
    low: 'Your {streak}-day streak is secure. Still, a quick session never hurts.',
    medium:
      '{hoursRemaining}h left to save your {streak}-day streak. A {duration}-min session is all it takes.',
    high: 'Only {hoursRemaining}h remaining! Your {streak}-day streak needs you.',
    critical:
      '{minutesRemaining}min left! Start a session NOW to save your streak.',
    default: 'Quick session to keep your streak going?',
  },
  weekly_reflection: {
    default:
      'This week: {sessionsCompleted} sessions, {totalFocusHours} hours, {xpEarned} XP, {levelUps} level-ups.',
  },
};

export function resolveFallbackTier(
  aiAvailable: boolean,
  hasContextData: boolean,
  errorRetryable: boolean,
): FallbackTier {
  if (aiAvailable) {return 'ai_success';}
  if (hasContextData) {return 'deterministic_contextual';}
  return 'quiet_degradation';
}

export function renderDeterministicMessage(
  category: string,
  subKey: string,
  context: Record<string, unknown>,
): string {
  const categoryMessages = DETERMINISTIC_MESSAGES[category];
  if (!categoryMessages) {return "We'll be back shortly.";}

  const template =
    categoryMessages[subKey] ?? categoryMessages.default ?? 'Stay focused.';
  let result = template;

  for (const [key, value] of Object.entries(context)) {
    result = result.replace(
      new RegExp(`\\{${key}\\}`, 'g'),
      String(value ?? ''),
    );
  }

  return result;
}

export function buildDegradedResponse(
  category: string,
  reason: string,
): FallbackResult {
  return {
    tier: 'quiet_degradation',
    content: '',
    showAI: false,
    debugMessage: `${category} unavailable: ${reason}`,
  };
}

export function buildDeterministicResponse(
  category: string,
  subKey: string,
  context: Record<string, unknown>,
): FallbackResult {
  return {
    tier: 'deterministic_contextual',
    content: renderDeterministicMessage(category, subKey, context),
    showAI: true,
    debugMessage: `Using deterministic fallback for ${category}:${subKey}`,
  };
}

export function buildAISuccessResponse(content: string): FallbackResult {
  return {
    tier: 'ai_success',
    content,
    showAI: true,
  };
}
