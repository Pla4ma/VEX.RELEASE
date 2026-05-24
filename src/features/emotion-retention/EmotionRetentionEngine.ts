import { getLanguageTier, type LanguageTier } from '../onboarding/language-tier';
import type { MotivationProfileType } from '../onboarding/schemas';

export interface RetentionIntervention {
  id: string;
  userId: string;
  kind: 'COMEBACK' | 'STREAK_RISK' | 'SESSION_REINFORCEMENT';
  message: string;
  createdAt: number;
  tier: LanguageTier;
}

const GENTLE_MESSAGES = {
  COMEBACK: 'Your rhythm restarts today. One session moves you forward.',
  STREAK_RISK: 'Your rhythm needs one focused session to stay alive.',
  SESSION_REINFORCEMENT: 'That session proved your focus is real. One more tomorrow.',
};

const INTENSE_MESSAGES = {
  COMEBACK: 'Your streak fell. The comeback quest begins now.',
  STREAK_RISK: 'Your streak is on the line. One session saves it.',
  SESSION_REINFORCEMENT: 'Victory. Your streak grows stronger. Tomorrow demands more.',
};

export function buildIntervention(
  userId: string,
  kind: RetentionIntervention['kind'],
  profileType: MotivationProfileType | null | undefined,
): RetentionIntervention {
  const tier = getLanguageTier(profileType);
  const messages = tier === 'gentle' ? GENTLE_MESSAGES : INTENSE_MESSAGES;

  return {
    id: `${kind}_${Date.now()}`,
    userId,
    kind,
    message: messages[kind],
    createdAt: Date.now(),
    tier,
  };
}
