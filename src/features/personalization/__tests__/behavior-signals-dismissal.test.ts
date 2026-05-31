import { describe, it, expect } from '@jest/globals';
import { resolveUserBehaviorSignals } from '../behavior-resolver';
import { makeSignal, makeSessions, baseInput } from './behavior-test-helpers';

describe('resolveUserBehaviorSignals – dismissal and ignore', () => {
  it('detects boss dismissed 3 times → boss_compact in ignoredFeatures', () => {
    const signals = [
      makeSignal({
        surfaceKey: 'boss_compact',
        signalType: 'surface_dismissed',
        source: 'home_content',
      }),
      makeSignal({
        surfaceKey: 'boss_compact',
        signalType: 'surface_dismissed',
        source: 'home_content',
        timestamp: Date.now() - 120_000,
      }),
      makeSignal({
        surfaceKey: 'boss_compact',
        signalType: 'surface_dismissed',
        source: 'home_content',
        timestamp: Date.now() - 180_000,
      }),
    ];
    const result = resolveUserBehaviorSignals({
      ...baseInput,
      recentSignals: signals,
    });
    expect(result.ignoredFeatures).toContain('boss_compact');
    expect(result.bossEngagement).toBe('none');
  });

  it('game-like user clicking boss repeatedly → boss engagement increases', () => {
    const signals = [
      makeSignal({
        surfaceKey: 'boss_compact',
        signalType: 'surface_clicked',
        source: 'boss_tab',
      }),
      makeSignal({
        surfaceKey: 'boss_compact',
        signalType: 'surface_clicked',
        source: 'boss_tab',
        timestamp: Date.now() - 120_000,
      }),
      makeSignal({
        surfaceKey: 'boss_compact',
        signalType: 'boss_cta_clicked',
        source: 'boss_tab',
      }),
      makeSignal({
        surfaceKey: 'boss_compact',
        signalType: 'boss_cta_clicked',
        source: 'boss_tab',
        timestamp: Date.now() - 120_000,
      }),
      makeSignal({
        surfaceKey: 'boss_compact',
        signalType: 'boss_cta_clicked',
        source: 'boss_tab',
        timestamp: Date.now() - 180_000,
      }),
      makeSignal({
        surfaceKey: 'boss_compact',
        signalType: 'boss_route_opened',
        source: 'boss_tab',
      }),
      makeSignal({
        surfaceKey: 'boss_compact',
        signalType: 'boss_route_opened',
        source: 'boss_tab',
        timestamp: Date.now() - 120_000,
      }),
    ];
    const result = resolveUserBehaviorSignals({
      ...baseInput,
      recentSignals: signals,
    });
    expect(result.bossEngagement).toBe('high');
    expect(result.ignoredFeatures).not.toContain('boss_compact');
  });

  it('study user opens study repeatedly → high studyUsageRatio', () => {
    const signals = [
      makeSignal({
        surfaceKey: 'study_layer',
        signalType: 'surface_clicked',
        source: 'study_layer',
      }),
      makeSignal({
        surfaceKey: 'study_layer',
        signalType: 'surface_clicked',
        source: 'study_layer',
        timestamp: Date.now() - 120_000,
      }),
      makeSignal({
        surfaceKey: 'study_layer',
        signalType: 'surface_clicked',
        source: 'study_layer',
        timestamp: Date.now() - 180_000,
      }),
    ];
    const sessions = makeSessions({
      completedSessions: 10,
      studySessions: 5,
      totalSessions: 12,
    });
    const result = resolveUserBehaviorSignals({
      recentSignals: signals,
      recentSessions: sessions,
      firstWeekExperience: { stage: 'POST_DAY_7', isDayZero: false },
    });
    expect(result.studyUsageRatio).toBeGreaterThan(0.3);
  });

  it('coach-led user accepts coach recommendations → coach interactions increase', () => {
    const signals = [
      makeSignal({
        surfaceKey: 'coach_presence',
        signalType: 'coach_surface_clicked',
        source: 'coach_presence',
      }),
      makeSignal({
        surfaceKey: 'coach_presence',
        signalType: 'coach_surface_clicked',
        source: 'coach_presence',
        timestamp: Date.now() - 120_000,
      }),
    ];
    const result = resolveUserBehaviorSignals({
      ...baseInput,
      recentSignals: signals,
    });
    expect(result.coachInteractions).toBeGreaterThanOrEqual(2);
  });

  it('user dismisses premium repeatedly → premium_tease is ignored', () => {
    const signals = [
      makeSignal({
        surfaceKey: 'premium_tease',
        signalType: 'surface_dismissed',
        source: 'home_content',
      }),
      makeSignal({
        surfaceKey: 'premium_tease',
        signalType: 'surface_dismissed',
        source: 'home_content',
        timestamp: Date.now() - 120_000,
      }),
      makeSignal({
        surfaceKey: 'premium_tease',
        signalType: 'surface_dismissed',
        source: 'home_content',
        timestamp: Date.now() - 180_000,
      }),
    ];
    const result = resolveUserBehaviorSignals({
      ...baseInput,
      recentSignals: signals,
    });
    expect(result.ignoredFeatures).toContain('premium_tease');
  });
});
