import { ACTIVE, PROGRESSIVE, ARCHIVED } from '../final-release-classification';
import { getAllEntries } from '../classification-codec';
import {
  FEATURE_THRESHOLDS,
  FEATURE_RELEASE_STATES,
} from '../feature-access-config';
import type { FeatureKey } from '../feature-access';
import { buildFeatureAccess, getFeatureAvailability } from '../feature-access';

describe('Classification — thresholds and release states match classification', () => {
  it('archived features have Infinity thresholds or deactivated state', () => {
    for (const entry of ARCHIVED) {
      if (entry.featureKey) {
        const threshold = FEATURE_THRESHOLDS[entry.featureKey as FeatureKey];
        const state = FEATURE_RELEASE_STATES[entry.featureKey as FeatureKey];
        const blocked = threshold === Number.POSITIVE_INFINITY
          || state === 'final_release_deactivated'
          || state === 'archived';
        expect(blocked).toBe(true);
      }
    }
  });

  it('active features have thresholds >= 0 and not Infinity', () => {
    for (const entry of ACTIVE) {
      if (entry.featureKey) {
        const threshold = FEATURE_THRESHOLDS[entry.featureKey as FeatureKey];
        expect(threshold).toBeLessThan(Number.POSITIVE_INFINITY);
      }
    }
  });

  it('progressive features have minSessions matching current FEATURE_THRESHOLDS', () => {
    for (const entry of PROGRESSIVE) {
      if (entry.featureKey && typeof entry.minSessions === 'number') {
        const threshold = FEATURE_THRESHOLDS[entry.featureKey as FeatureKey];
        expect(threshold).toBe(entry.minSessions);
      }
    }
  });

  it('economy_basic is deactivated (blocked by state not threshold)', () => {
    const econEntry = getAllEntries().find((e) => e.systemId === 'economy_user_facing');
    expect(econEntry).toBeDefined();
    expect(econEntry!.status).toBe('archived_or_deactivated');
    expect(FEATURE_RELEASE_STATES.economy_basic).toBe('final_release_deactivated');
    const { features } = buildFeatureAccess({ totalCompletedSessions: 999 });
    const avail = getFeatureAvailability(features.economy_basic);
    expect(avail.state).toBe('disabled');
    expect(avail.canQuery).toBe(false);
  });
});
