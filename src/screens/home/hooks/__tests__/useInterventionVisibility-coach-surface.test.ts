import {
  resolveInterventionVisibility,
  defaultSurfaceMap,
  makeIntervention,
  makeFeatures,
} from './useInterventionVisibility-helpers';
import type { HomeSurfaceMap } from '../../../../features/home-experience/surface-decision-schemas';

describe('resolveInterventionVisibility — coach & surface gating', () => {
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
});
