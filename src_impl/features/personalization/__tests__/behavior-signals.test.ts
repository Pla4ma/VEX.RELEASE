import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  BehaviorSignalSchema,
  type BehaviorSignal,
} from '../behavior-signal-schemas';
import { resolveUserBehaviorSignals } from '../behavior-resolver';
import type { BehaviorResolverInput } from '../behavior-signal-schemas';

function makeSignal(overrides: Partial<BehaviorSignal>): BehaviorSignal {
  return BehaviorSignalSchema.parse({
    userId: '550e8400-e29b-41d4-a716-446655440000',
    surfaceKey: 'boss_compact',
    signalType: 'surface_dismissed',
    source: 'home_content',
    timestamp: Date.now() - 60_000,
    ...overrides,
  });
}

function makeSessions(overrides: Partial<BehaviorResolverInput['recentSessions']> = {}): BehaviorResolverInput['recentSessions'] {
  return {
    completedSessions: 5,
    studySessions: 2,
    totalSessions: 8,
    preferredMode: 'FOCUS',
    bestTimeOfDay: 'morning',
    ...overrides,
  };
}

const baseInput: Omit<BehaviorResolverInput, 'recentSignals'> = {
  recentSessions: makeSessions(),
  firstWeekExperience: { stage: 'POST_DAY_7', isDayZero: false },
};

describe('resolveUserBehaviorSignals', () => {
  it('detects boss dismissed 3 times → boss_compact in ignoredFeatures', () => {
    const signals = [
      makeSignal({ surfaceKey: 'boss_compact', signalType: 'surface_dismissed', source: 'home_content' }),
      makeSignal({ surfaceKey: 'boss_compact', signalType: 'surface_dismissed', source: 'home_content', timestamp: Date.now() - 120_000 }),
      makeSignal({ surfaceKey: 'boss_compact', signalType: 'surface_dismissed', source: 'home_content', timestamp: Date.now() - 180_000 }),
    ];
    const result = resolveUserBehaviorSignals({ ...baseInput, recentSignals: signals });
    expect(result.ignoredFeatures).toContain('boss_compact');
    expect(result.bossEngagement).toBe('none');
  });

  it('game-like user clicking boss repeatedly → boss engagement increases', () => {
    const signals = [
      makeSignal({ surfaceKey: 'boss_compact', signalType: 'surface_clicked', source: 'boss_tab' }),
      makeSignal({ surfaceKey: 'boss_compact', signalType: 'surface_clicked', source: 'boss_tab', timestamp: Date.now() - 120_000 }),
      makeSignal({ surfaceKey: 'boss_compact', signalType: 'boss_cta_clicked', source: 'boss_tab' }),
      makeSignal({ surfaceKey: 'boss_compact', signalType: 'boss_cta_clicked', source: 'boss_tab', timestamp: Date.now() - 120_000 }),
      makeSignal({ surfaceKey: 'boss_compact', signalType: 'boss_cta_clicked', source: 'boss_tab', timestamp: Date.now() - 180_000 }),
      makeSignal({ surfaceKey: 'boss_compact', signalType: 'boss_route_opened', source: 'boss_tab' }),
      makeSignal({ surfaceKey: 'boss_compact', signalType: 'boss_route_opened', source: 'boss_tab', timestamp: Date.now() - 120_000 }),
    ];
    const result = resolveUserBehaviorSignals({ ...baseInput, recentSignals: signals });
    expect(result.bossEngagement).toBe('high');
    expect(result.ignoredFeatures).not.toContain('boss_compact');
  });

  it('study user opens study repeatedly → high studyUsageRatio', () => {
    const signals = [
      makeSignal({ surfaceKey: 'study_layer', signalType: 'surface_clicked', source: 'study_layer' }),
      makeSignal({ surfaceKey: 'study_layer', signalType: 'surface_clicked', source: 'study_layer', timestamp: Date.now() - 120_000 }),
      makeSignal({ surfaceKey: 'study_layer', signalType: 'surface_clicked', source: 'study_layer', timestamp: Date.now() - 180_000 }),
    ];
    const sessions = makeSessions({ completedSessions: 10, studySessions: 5, totalSessions: 12 });
    const result = resolveUserBehaviorSignals({ recentSignals: signals, recentSessions: sessions, firstWeekExperience: { stage: 'POST_DAY_7', isDayZero: false } });
    expect(result.studyUsageRatio).toBeGreaterThan(0.3);
  });

  it('coach-led user accepts coach recommendations → coach interactions increase', () => {
    const signals = [
      makeSignal({ surfaceKey: 'coach_presence', signalType: 'coach_surface_clicked', source: 'coach_presence' }),
      makeSignal({ surfaceKey: 'coach_presence', signalType: 'coach_surface_clicked', source: 'coach_presence', timestamp: Date.now() - 120_000 }),
    ];
    const result = resolveUserBehaviorSignals({ ...baseInput, recentSignals: signals });
    expect(result.coachInteractions).toBeGreaterThanOrEqual(2);
  });

  it('user dismisses premium repeatedly → premium_tease is ignored', () => {
    const signals = [
      makeSignal({ surfaceKey: 'premium_tease', signalType: 'surface_dismissed', source: 'home_content' }),
      makeSignal({ surfaceKey: 'premium_tease', signalType: 'surface_dismissed', source: 'home_content', timestamp: Date.now() - 120_000 }),
      makeSignal({ surfaceKey: 'premium_tease', signalType: 'surface_dismissed', source: 'home_content', timestamp: Date.now() - 180_000 }),
    ];
    const result = resolveUserBehaviorSignals({ ...baseInput, recentSignals: signals });
    expect(result.ignoredFeatures).toContain('premium_tease');
  });

  it('premium attempt after 5 sessions → premium_moment appears', () => {
    const signals = [
      makeSignal({ surfaceKey: 'premium_tease', signalType: 'premium_gate_clicked', source: 'premium_gate' }),
      makeSignal({ surfaceKey: 'premium_tease', signalType: 'premium_gate_clicked', source: 'premium_gate' }),
      makeSignal({ surfaceKey: 'premium_tease', signalType: 'premium_gate_clicked', source: 'premium_gate' }),
    ];
    const sessions = makeSessions({ completedSessions: 7 });
    const result = resolveUserBehaviorSignals({ recentSignals: signals, recentSessions: sessions, firstWeekExperience: { stage: 'POST_DAY_7', isDayZero: false } });
    expect(result.highIntentPremiumActions).toContain('premium_moment');
    expect(result.premiumFeatureAttempts.length).toBeGreaterThan(0);
  });

  it('does not allow premium moment with insufficient sessions', () => {
    const signals = [
      makeSignal({ surfaceKey: 'premium_tease', signalType: 'premium_gate_clicked', source: 'premium_gate' }),
      makeSignal({ surfaceKey: 'premium_tease', signalType: 'premium_gate_clicked', source: 'premium_gate' }),
      makeSignal({ surfaceKey: 'premium_tease', signalType: 'premium_gate_clicked', source: 'premium_gate' }),
    ];
    const sessions = makeSessions({ completedSessions: 3 });
    const result = resolveUserBehaviorSignals({ recentSignals: signals, recentSessions: sessions, firstWeekExperience: { stage: 'POST_DAY_7', isDayZero: false } });
    expect(result.highIntentPremiumActions).toHaveLength(0);
  });

  it('day zero user → all signals are zeroed out', () => {
    const signals = [
      makeSignal({ surfaceKey: 'boss_compact', signalType: 'surface_dismissed', source: 'home_content' }),
    ];
    const result = resolveUserBehaviorSignals({ recentSignals: signals, recentSessions: makeSessions({ completedSessions: 0, totalSessions: 0, studySessions: 0 }), firstWeekExperience: { stage: 'DAY_0_NOT_STARTED', isDayZero: true } });
    expect(result.ignoredFeatures).toHaveLength(0);
    expect(result.bossEngagement).toBe('none');
    expect(result.highIntentPremiumActions).toHaveLength(0);
  });

  it('no sensitive content in signals', () => {
    const signals = [
      makeSignal({ surfaceKey: 'study_layer', signalType: 'surface_clicked', source: 'study_layer' }),
    ];
    const result = resolveUserBehaviorSignals({ ...baseInput, recentSignals: signals });
    const serialized = JSON.stringify(result);
    expect(serialized).not.toMatch(/password|secret|token|api.?key/i);
    expect(serialized).not.toMatch(/content|message.*body|ai.*message|document/i);
  });
});
