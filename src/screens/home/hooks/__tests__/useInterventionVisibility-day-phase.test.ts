import {
  resolveInterventionVisibility,
  defaultSurfaceMap,
  makeIntervention,
  makeFeatures,
  makeFWE,
} from './useInterventionVisibility-helpers';

describe('resolveInterventionVisibility — day phase & loading', () => {
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
