import {
  BehaviorSignalSchema,
  type BehaviorSignal,
} from '../behavior-signal-schemas';
import type { BehaviorResolverInput } from '../behavior-signal-schemas';

export function makeSignal(overrides: Partial<BehaviorSignal>): BehaviorSignal {
  return BehaviorSignalSchema.parse({
    userId: '550e8400-e29b-41d4-a716-446655440000',
    surfaceKey: 'boss_compact',
    signalType: 'surface_dismissed',
    source: 'home_content',
    timestamp: Date.now() - 60_000,
    ...overrides,
  });
}

export function makeSessions(
  overrides: Partial<BehaviorResolverInput['recentSessions']> = {},
): BehaviorResolverInput['recentSessions'] {
  return {
    completedSessions: 5,
    studySessions: 2,
    deepWorkSessions: 0,
    learningSessions: 0,
    creativeSessions: 0,
    totalSessions: 8,
    preferredMode: 'FOCUS',
    bestTimeOfDay: 'morning',
    ...overrides,
  };
}

export const baseInput: Omit<BehaviorResolverInput, 'recentSignals'> = {
  recentSessions: makeSessions(),
  firstWeekExperience: { stage: 'POST_DAY_7', isDayZero: false },
};
