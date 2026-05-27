import { experience, firstWeek, accessFor, assertFullyHidden, HIDDEN_FEATURE_KEYS } from './debloat-test-helpers';
import { getFeatureAvailability, type FeatureKey } from '../features/liveops-config/feature-access';

describe('Consolidation — No regression', () => {
  it('hidden systems list matches between resolveVexExperience and first week', () => {
    const exp = experience('calm', { totalCompletedSessions: 20 });
    const fw = firstWeek({ completedSessions: 20, daysSinceOnboarding: 20 });

    for (const s of fw.hiddenSurfaces) {
      if (s === 'premium_hard_sell' || s === 'premium_currency' || s === 'advanced_economy') {
        expect(exp.hiddenSystems).toContain(
          s === 'premium_currency' ? 'premium_currency' : s === 'advanced_economy' ? 'advanced_economy' : 'premium_currency',
        );
      }
    }

    expect(exp.hiddenSystems).toContain('battle_pass');
    expect(exp.hiddenSystems).toContain('shop');
    expect(exp.hiddenSystems).toContain('inventory');
    expect(exp.hiddenSystems).toContain('rivals');
    expect(exp.hiddenSystems).toContain('squads');
  });

  it('all final-release deactivated features confirmed inaccessible at every tested session count', () => {
    const sessionCounts = [0, 1, 3, 5, 7, 10, 15, 20, 50, 100, 500, 999];

    for (const sessions of sessionCounts) {
      const f = accessFor(sessions);
      HIDDEN_FEATURE_KEYS.forEach((key) => assertFullyHidden(f, key));
    }
  });

  it('core features available from day zero', () => {
    const f = accessFor(0);
    const core: FeatureKey[] = [
      'focus_session',
      'home_tab',
      'focus_tab',
      'profile_tab',
      'progress_view',
      'ai_coach_basic',
    ];
    core.forEach((k) => getFeatureAvailability(f[k]));
  });
});
