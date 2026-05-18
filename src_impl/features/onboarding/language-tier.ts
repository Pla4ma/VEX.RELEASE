import { z } from 'zod';
import type { MotivationProfileType } from './schemas';

export const LanguageTierSchema = z.enum(['gentle', 'intense']);
export type LanguageTier = z.infer<typeof LanguageTierSchema>;

const TIER_MAP: Record<MotivationProfileType, LanguageTier> = {
  calm: 'gentle',
  friendly: 'gentle',
  student: 'gentle',
  creator: 'gentle',
  worker: 'gentle',
  game_like: 'intense',
  competitive: 'intense',
  intense: 'intense',
};

export function getLanguageTier(profileType: MotivationProfileType | null | undefined): LanguageTier {
  if (!profileType) return 'gentle';
  return TIER_MAP[profileType] ?? 'gentle';
}

export interface LanguageSet {
  streakBrokenTitle: string;
  streakBrokenMessage: string;
  streakFuneralTitle: string;
  streakFuneralMessage: string;
  streakAtRiskTitle: string;
  streakAtRiskMessage: string;
  purityLabel: { Elite: string; Good: string; Okay: string; Distracted: string };
  bossIntro: string;
  bossDamage: string;
  challengeTitle: string;
  coinLabel: string;
  xpLabel: string;
  comebackTitle: string;
  comebackMessage: string;
}

export const GENTLE_LANGUAGE: LanguageSet = {
  streakBrokenTitle: 'Your streak paused',
  streakBrokenMessage: 'A new rhythm starts today. Your focus history is still yours.',
  streakFuneralTitle: 'Rhythm restore',
  streakFuneralMessage: 'Every comeback builds real consistency. Start fresh.',
  streakAtRiskTitle: 'Your rhythm needs one session',
  streakAtRiskMessage: 'One focused session keeps your consistency alive.',
  purityLabel: {
    Elite: 'Exceptional',
    Good: 'Strong',
    Okay: 'Steady',
    Distracted: 'Learning',
  },
  bossIntro: 'Your focus challenge',
  bossDamage: 'Progress made',
  challengeTitle: 'Your next step',
  coinLabel: 'Points',
  xpLabel: 'Growth',
  comebackTitle: 'Welcome back',
  comebackMessage: 'Your rhythm restarts today. One session moves you forward.',
};

export const INTENSE_LANGUAGE: LanguageSet = {
  streakBrokenTitle: 'Streak broken',
  streakBrokenMessage: 'Your streak died. Time for a comeback quest.',
  streakFuneralTitle: 'Streak funeral',
  streakFuneralMessage: 'Honor what you built. Rise again stronger.',
  streakAtRiskTitle: 'Streak at risk',
  streakAtRiskMessage: 'Your streak is on the line. One session saves it.',
  purityLabel: {
    Elite: 'Elite',
    Good: 'Good',
    Okay: 'Okay',
    Distracted: 'Distracted',
  },
  bossIntro: 'Boss battle',
  bossDamage: 'Damage dealt',
  challengeTitle: 'Challenge active',
  coinLabel: 'Coins',
  xpLabel: 'XP',
  comebackTitle: 'Comeback quest',
  comebackMessage: 'Your streak fell. The comeback quest begins now.',
};

export function getActiveLanguage(tier: LanguageTier): LanguageSet {
  return tier === 'gentle' ? GENTLE_LANGUAGE : INTENSE_LANGUAGE;
}
