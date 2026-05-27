import {
  resolvePremiumStrategy,
  resolvePremiumTiming,
  getLanePremiumValue,
  mapProfileToLane,
  blockedEconomyTerms,
} from './premium-durable-helpers';

describe('premium visible if healthy and value proof', () => {
  it('shows paywall at session 40+ with healthy billing', () => {
    const result = resolvePremiumTiming({
      completedSessions: 40,
      revenueCatHealthy: true,
      billingConfigured: true,
    });
    expect(result.tier).toBe('eligible');
    expect(result.canShowPaywall).toBe(true);
    expect(result.canRenderPremiumCTA).toBe(true);
  });

  it('teases but does not paywall at session 5-39', () => {
    for (const sessions of [5, 10, 25, 39]) {
      const result = resolvePremiumTiming({
        completedSessions: sessions,
        revenueCatHealthy: true,
        billingConfigured: true,
      });
      expect(result.tier).toBe('soft_tease');
      expect(result.canShowPaywall).toBe(false);
      expect(result.canTeaseEntries).toBe(true);
    }
  });

  it('allows high-intent trigger at or after session 5', () => {
    const strategy = resolvePremiumStrategy({
      billingConfigured: true,
      completedSessions: 5,
      highIntentAction: 'weekly_intelligence',
    });
    expect(strategy.canShowPaywall).toBe(true);
    expect(strategy.triggerMoment).toBe('weekly_intelligence');
  });
});

describe('lane-specific premium copy', () => {
  it('each lane has distinct durable value copy', () => {
    const study = getLanePremiumValue('study');
    const run = getLanePremiumValue('run');
    const project = getLanePremiumValue('project');
    const clean = getLanePremiumValue('clean');

    expect(study.headline).toContain('study');
    expect(run.headline).toContain('run');
    expect(project.headline).toContain('project');
    expect(clean.headline).toContain('quiet');

    const allLaneCopy = [
      ...study.features, study.headline, study.body,
      ...run.features, run.headline, run.body,
      ...project.features, project.headline, project.body,
      ...clean.features, clean.headline, clean.body,
    ].join(' ').toLowerCase();

    for (const term of blockedEconomyTerms) {
      const positiveUse = new RegExp(
        `(?<!(no|not|without|never|0)[\\s\\S]{0,30})${term}`, 'i',
      );
      expect(allLaneCopy).not.toMatch(positiveUse);
    }
  });

  it('mapProfileToLane returns correct premium lanes', () => {
    expect(mapProfileToLane('student')).toBe('study');
    expect(mapProfileToLane('competitive')).toBe('run');
    expect(mapProfileToLane('deep_creative')).toBe('project');
    expect(mapProfileToLane('calm')).toBe('clean');
  });
});
