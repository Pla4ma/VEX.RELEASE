import { StreakShieldMomentInputSchema } from './schemas';
import type {
  StreakShieldMomentInput,
  StreakShieldMomentResult,
  StreakShieldRecord,
  StreakShieldRouteParams,
} from './types';

export const STREAK_SHIELD_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

export const STREAK_SHIELD_COPY = {
  body: 'You just proved this routine matters. Streak Shield can protect one missed day when life interrupts.',
  cta: 'Protect My Streak',
  headline: 'Your streak is worth protecting.',
  secondary: 'Not Now',
} as const;

const STREAK_SHIELD_ROUTE_PARAMS: StreakShieldRouteParams = {
  contextBody: STREAK_SHIELD_COPY.body,
  contextCta: STREAK_SHIELD_COPY.cta,
  contextHeadline: STREAK_SHIELD_COPY.headline,
  gatedFeature: 'streak_freeze',
  source: 'post_session_streak_shield',
};

export function assessStreakShieldMoment(
  rawInput: StreakShieldMomentInput,
): StreakShieldMomentResult {
  const input = StreakShieldMomentInputSchema.parse(rawInput);
  const base = {
    copy: STREAK_SHIELD_COPY,
    routeParams: STREAK_SHIELD_ROUTE_PARAMS,
  };

  if (input.isPremium) {
    return { ...base, reason: 'premium', shouldShow: false };
  }
  if (input.streakDays < 5) {
    return { ...base, reason: 'streak', shouldShow: false };
  }
  if (input.finalScore < 84) {
    return { ...base, reason: 'grade', shouldShow: false };
  }
  if (input.paywallShownThisSession || input.lastShownSessionId === input.sessionId) {
    return { ...base, reason: 'session', shouldShow: false };
  }
  if (input.lastShownAt && input.now - input.lastShownAt < STREAK_SHIELD_COOLDOWN_MS) {
    return { ...base, reason: 'cooldown', shouldShow: false };
  }
  return { ...base, reason: 'eligible', shouldShow: true };
}

export async function buildStreakShieldMoment(
  input: {
    finalScore: number;
    isPremium: boolean;
    now: number;
    paywallShownThisSession: boolean;
    record: StreakShieldRecord | null;
    sessionId: string;
    streakDays: number;
    userId: string;
  },
): Promise<StreakShieldMomentResult> {
  return assessStreakShieldMoment({
    finalScore: input.finalScore,
    isPremium: input.isPremium,
    lastShownAt: input.record?.lastShownAt ?? null,
    lastShownSessionId: input.record?.lastShownSessionId ?? null,
    now: input.now,
    paywallShownThisSession: input.paywallShownThisSession,
    sessionId: input.sessionId,
    streakDays: input.streakDays,
    userId: input.userId,
  });
}

export function createStreakShieldRecord(
  sessionId: string,
  shownAt: number,
): StreakShieldRecord {
  return { lastShownAt: shownAt, lastShownSessionId: sessionId };
}
