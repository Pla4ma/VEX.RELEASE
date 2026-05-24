import { resolveInterventionVisibility } from '../useInterventionVisibility';
import type { HomeSurfaceMap } from '../../../../features/home-experience/surface-decision-schemas';
import type { FirstWeekExperience } from '../../../../features/personalization/first-week-schemas';
import type { ActiveIntervention } from '../../../../features/ai-coach/hooks';
import type { FeatureAccessMap } from '../../../../features/liveops-config/feature-access';

const defaultSurfaceMap: HomeSurfaceMap = {
  start_session: 'primary',
  coach_presence: 'secondary',
  progress_proof: 'hidden',
  focus_score: 'hidden',
  progress_detail: 'hidden',
  study_layer: 'hidden',
  companion_thread: 'hidden',
  boss_teaser: 'hidden',
  boss_compact: 'hidden',
  boss_full_cta: 'hidden',
  challenge_teaser: 'hidden',
  unlock_strip: 'hidden',
  premium_tease: 'hidden',
  weekly_quest: 'hidden',
};

function makeIntervention(overrides: Partial<ActiveIntervention> = {}): ActiveIntervention {
  return {
    id: 'int-1',
    type: 'STREAK_RISK',
    message: 'Your streak is at risk!',
    priority: 5,
    hoursRemaining: 1,
    actionLabel: 'Start session',
    metadata: {},
    ...overrides,
  };
}

function makeFeatures(overrides: Partial<Record<string, unknown>> = {}): FeatureAccessMap {
  return {
    ai_coach_advanced: {
      isUnlocked: true,
      isVisible: true,
      isTeased: false,
      lockedDescription: '',
      unlockReason: '',
      isDegraded: false,
      releaseState: 'final_release_progressive',
      priority: 5,
      threshold: 8,
      ...(overrides.ai_coach_advanced as Record<string, unknown> ?? {}),
    } as FeatureAccessMap['ai_coach_advanced'],
    ai_coach_basic: {
      isUnlocked: true,
      isVisible: true,
      isTeased: false,
      lockedDescription: '',
      unlockReason: '',
      isDegraded: false,
      releaseState: 'final_release_core',
      priority: 1,
      threshold: 0,
      ...(overrides.ai_coach_basic as Record<string, unknown> ?? {}),
    } as FeatureAccessMap['ai_coach_basic'],
    challenges: {
      isUnlocked: true,
      isVisible: true,
      lockedDescription: '',
      unlockReason: '',
      releaseState: 'final_release_progressive',
      ...(overrides.challenges as Record<string, unknown> ?? {}),
    } as FeatureAccessMap['challenges'],
  } as FeatureAccessMap;
}

function makeFWE(stage: string): FirstWeekExperience {
  return {
    currentDayStage: stage as FirstWeekExperience['currentDayStage'],
    allowedHomeSurfaces: ['start_session', 'coach_presence_line'],
    hiddenSurfaces: ['shop', 'inventory', 'battle_pass'],
    bossIntensity: 'hidden',
    coachMessageType: 'encouraging',
    comebackState: 'none',
    completionEmphasis: 'progress',
    notificationAllowedTypes: ['streak_reminder'],
    premiumMoment: 'none',
    primaryCTA: { intent: 'START_SESSION', label: 'Start a session' },
    primaryMessage: 'Welcome back',
    secondaryCTA: { intent: 'OPEN_PROGRESS', label: 'View progress' },
    spotlightSurface: 'progress_proof',
    studyLayerLabel: 'Study OS',
    unlockTease: null,
  };
}

describe('resolveInterventionVisibility', () => {
  it('Day 0 — no intervention banner', () => {
    const result = resolveInterventionVisibility({
      intervention: makeIntervention(),
      interventionLoading: false,
      surfaceMap: defaultSurfaceMap,
      firstWeekExperience: makeFWE('DAY_0_NOT_STARTED'),
      features: makeFeatures(),
      totalCompletedSessions: 0,
    });
    expect(result.canShowBanner).toBe(false);
    expect(result.interventionType).toBe('hidden');
    expect(result.reason).toContain('Day 0');
  });

  it('Day 0 — totalCompletedSessions === 0 blocks banner', () => {
    const result = resolveInterventionVisibility({
      intervention: makeIntervention(),
      interventionLoading: false,
      surfaceMap: defaultSurfaceMap,
      features: makeFeatures(),
      totalCompletedSessions: 0,
    });
    expect(result.canShowBanner).toBe(false);
  });

  it('Day 1 — low priority intervention suppressed', () => {
    const result = resolveInterventionVisibility({
      intervention: makeIntervention({ priority: 2 }),
      interventionLoading: false,
      surfaceMap: defaultSurfaceMap,
      firstWeekExperience: makeFWE('DAY_1_RETURN'),
      features: makeFeatures(),
      totalCompletedSessions: 1,
    });
    expect(result.canShowBanner).toBe(false);
    expect(result.reason).toContain('Day 1');
  });

  it('Day 1 — high priority intervention allowed', () => {
    const result = resolveInterventionVisibility({
      intervention: makeIntervention({ priority: 5 }),
      interventionLoading: false,
      surfaceMap: defaultSurfaceMap,
      firstWeekExperience: makeFWE('DAY_1_RETURN'),
      features: makeFeatures(),
      totalCompletedSessions: 1,
    });
    expect(result.canShowBanner).toBe(true);
    expect(result.interventionType).toBe('soft');
  });

  it('AI Coach degraded — no advanced intervention', () => {
    const features = makeFeatures({
      ai_coach_advanced: { isDegraded: true, isUnlocked: true, isVisible: true },
    });
    const result = resolveInterventionVisibility({
      intervention: makeIntervention({ priority: 5 }),
      interventionLoading: false,
      surfaceMap: defaultSurfaceMap,
      features,
      totalCompletedSessions: 10,
    });
    expect(result.canShowBanner).toBe(false);
    expect(result.reason).toContain('unavailable');
  });

  it('Engaged coach-led user can see intervention', () => {
    const features = makeFeatures({
      ai_coach_advanced: { isUnlocked: true, isVisible: true, isDegraded: false },
    });
    const result = resolveInterventionVisibility({
      intervention: makeIntervention({ priority: 5 }),
      interventionLoading: false,
      surfaceMap: defaultSurfaceMap,
      features,
      totalCompletedSessions: 10,
    });
    expect(result.canShowBanner).toBe(true);
  });

  it('Calm user with high priority intervention sees soft intervention', () => {
    const calmMap: HomeSurfaceMap = { ...defaultSurfaceMap, coach_presence: 'tiny_tease' };
    const result = resolveInterventionVisibility({
      intervention: makeIntervention({ priority: 4 }),
      interventionLoading: false,
      surfaceMap: calmMap,
      features: makeFeatures(),
      totalCompletedSessions: 5,
    });
    expect(result.canShowBanner).toBe(true);
    expect(result.interventionType).toBe('soft');
  });

  it('Calm user with low priority intervention suppressed', () => {
    const calmMap: HomeSurfaceMap = { ...defaultSurfaceMap, coach_presence: 'tiny_tease' };
    const result = resolveInterventionVisibility({
      intervention: makeIntervention({ priority: 2 }),
      interventionLoading: false,
      surfaceMap: calmMap,
      features: makeFeatures(),
      totalCompletedSessions: 5,
    });
    expect(result.canShowBanner).toBe(false);
  });

  it('Hidden coach surface suppresses banner', () => {
    const hiddenMap: HomeSurfaceMap = { ...defaultSurfaceMap, coach_presence: 'hidden' };
    const result = resolveInterventionVisibility({
      intervention: makeIntervention({ priority: 5 }),
      interventionLoading: false,
      surfaceMap: hiddenMap,
      features: makeFeatures(),
      totalCompletedSessions: 10,
    });
    expect(result.canShowBanner).toBe(false);
  });

  it('Blocked coach surface suppresses banner', () => {
    const blockedMap: HomeSurfaceMap = { ...defaultSurfaceMap, coach_presence: 'blocked' };
    const result = resolveInterventionVisibility({
      intervention: makeIntervention({ priority: 5 }),
      interventionLoading: false,
      surfaceMap: blockedMap,
      features: makeFeatures(),
      totalCompletedSessions: 10,
    });
    expect(result.canShowBanner).toBe(false);
  });

  it('No intervention returns hidden', () => {
    const result = resolveInterventionVisibility({
      intervention: null,
      interventionLoading: false,
      surfaceMap: defaultSurfaceMap,
      features: makeFeatures(),
      totalCompletedSessions: 5,
    });
    expect(result.canShowBanner).toBe(false);
  });

  it('Intervention loading returns hidden', () => {
    const result = resolveInterventionVisibility({
      intervention: makeIntervention(),
      interventionLoading: true,
      surfaceMap: defaultSurfaceMap,
      features: makeFeatures(),
      totalCompletedSessions: 5,
    });
    expect(result.canShowBanner).toBe(false);
  });

  it('Post Day 7 with active coach allows intervention', () => {
    const result = resolveInterventionVisibility({
      intervention: makeIntervention({ priority: 5 }),
      interventionLoading: false,
      surfaceMap: defaultSurfaceMap,
      firstWeekExperience: makeFWE('POST_DAY_7'),
      features: makeFeatures(),
      totalCompletedSessions: 15,
    });
    expect(result.canShowBanner).toBe(true);
    expect(result.interventionType).toBe('intrusive');
  });
});
