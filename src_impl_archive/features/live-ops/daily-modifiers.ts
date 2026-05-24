import { z } from 'zod';

import { resolveSessionMode, SessionMode } from '../../session/modes';

/*
Dependencies: session modes, session reward calculation, boss damage integration
Consumers: session completion rewards, active boss damage, home/retention surfaces
*/

export const DailyModifierSchema = z.object({
  id: z.string().min(1),
  dayOfWeek: z.number().int().min(0).max(6),
  title: z.string().min(1),
  body: z.string().min(1),
  preferredMode: z.nativeEnum(SessionMode).nullable(),
  xpMultiplier: z.number().min(1),
  coinMultiplier: z.number().min(1),
  bossDamageMultiplier: z.number().min(1),
  shopDiscountPercent: z.number().int().min(0).max(100),
}).strict();

export type DailyModifier = z.infer<typeof DailyModifierSchema>;

const DAILY_MODIFIERS: Record<number, DailyModifier> = {
  0: DailyModifierSchema.parse({
    id: 'sunday-rest-prep',
    dayOfWeek: 0,
    title: 'Rest and Prep',
    body: 'Shop pressure drops today. Bank supplies before the week fights back.',
    preferredMode: null,
    xpMultiplier: 1,
    coinMultiplier: 1.1,
    bossDamageMultiplier: 1,
    shopDiscountPercent: 25,
  }),
  1: DailyModifierSchema.parse({
    id: 'monday-demon-domain',
    dayOfWeek: 1,
    title: "Monday Demon's Domain",
    body: 'Bosses are softer today. Start the week by taking health off the board.',
    preferredMode: SessionMode.DEEP_WORK,
    xpMultiplier: 1.1,
    coinMultiplier: 1,
    bossDamageMultiplier: 1.25,
    shopDiscountPercent: 0,
  }),
  2: DailyModifierSchema.parse({
    id: 'deep-work-tuesday',
    dayOfWeek: 2,
    title: 'Deep Work Tuesday',
    body: 'Deep Work pays extra today. Long clean sessions hit harder.',
    preferredMode: SessionMode.DEEP_WORK,
    xpMultiplier: 1.5,
    coinMultiplier: 1,
    bossDamageMultiplier: 1.1,
    shopDiscountPercent: 0,
  }),
  3: DailyModifierSchema.parse({
    id: 'midweek-sprint',
    dayOfWeek: 3,
    title: 'Midweek Sprint',
    body: 'Sprint sessions deal double boss damage. Short sessions have teeth.',
    preferredMode: SessionMode.SPRINT,
    xpMultiplier: 1.2,
    coinMultiplier: 1,
    bossDamageMultiplier: 2,
    shopDiscountPercent: 0,
  }),
  4: DailyModifierSchema.parse({
    id: 'study-power-hour',
    dayOfWeek: 4,
    title: 'Study Power Hour',
    body: 'Study bonuses are amplified. Recall work turns into real XP.',
    preferredMode: SessionMode.STUDY,
    xpMultiplier: 1.35,
    coinMultiplier: 1,
    bossDamageMultiplier: 1,
    shopDiscountPercent: 0,
  }),
  5: DailyModifierSchema.parse({
    id: 'creative-flow-friday',
    dayOfWeek: 5,
    title: 'Creative Flow',
    body: 'Creative sessions get a flow payout. Stay in it and cash out.',
    preferredMode: SessionMode.CREATIVE,
    xpMultiplier: 1.3,
    coinMultiplier: 1.15,
    bossDamageMultiplier: 1,
    shopDiscountPercent: 0,
  }),
  6: DailyModifierSchema.parse({
    id: 'squad-saturday',
    dayOfWeek: 6,
    title: 'Squad Saturday',
    body: 'Boss damage gets louder today. Your session helps the whole board.',
    preferredMode: null,
    xpMultiplier: 1.1,
    coinMultiplier: 1,
    bossDamageMultiplier: 1.5,
    shopDiscountPercent: 0,
  }),
};

function dayFromTimestamp(timestamp?: number): number {
  return new Date(timestamp ?? Date.now()).getDay();
}

function modeMatches(modifier: DailyModifier, sessionMode: unknown): boolean {
  if (!modifier.preferredMode) {
    return true;
  }
  return resolveSessionMode(sessionMode) === modifier.preferredMode;
}

export function getDailyModifier(timestamp?: number): DailyModifier {
  const modifier = DAILY_MODIFIERS[dayFromTimestamp(timestamp)];
  return DailyModifierSchema.parse(modifier);
}

export function getDailyRewardMultiplier(input: {
  sessionMode: unknown;
  timestamp?: number;
}): number {
  const modifier = getDailyModifier(input.timestamp);
  return modeMatches(modifier, input.sessionMode) ? modifier.xpMultiplier : 1;
}

export function getDailyCoinMultiplier(input: {
  sessionMode: unknown;
  timestamp?: number;
}): number {
  const modifier = getDailyModifier(input.timestamp);
  return modeMatches(modifier, input.sessionMode) ? modifier.coinMultiplier : 1;
}

export function getDailyBossDamageMultiplier(input: {
  sessionMode: unknown;
  timestamp?: number;
}): number {
  const modifier = getDailyModifier(input.timestamp);
  return modeMatches(modifier, input.sessionMode) ? modifier.bossDamageMultiplier : 1;
}

export function buildDailyModifierSummary(input: {
  sessionMode: unknown;
  timestamp?: number;
}): {
  modifier: DailyModifier;
  isMatched: boolean;
  rewardMultiplier: number;
  bossDamageMultiplier: number;
} {
  const modifier = getDailyModifier(input.timestamp);
  const isMatched = modeMatches(modifier, input.sessionMode);
  return {
    modifier,
    isMatched,
    rewardMultiplier: isMatched ? modifier.xpMultiplier : 1,
    bossDamageMultiplier: isMatched ? modifier.bossDamageMultiplier : 1,
  };
}
