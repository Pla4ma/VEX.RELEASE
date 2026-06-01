import { ARCHIVED } from '../final-release-classification';
import type { FeatureKey } from '../feature-access';
import { buildFeatureAccess, getFeatureAvailability } from '../feature-access';

describe('Classification — archived features cannot subscribe', () => {
  it('no archived entry has subscriptionAllowed=true', () => {
    for (const entry of ARCHIVED) {
      expect(entry.subscriptionAllowed).toBe(false);
    }
  });

  it('feature availability blocks subscriptions for archived features at all session counts', () => {
    const archivedKeys: FeatureKey[] = ARCHIVED.filter(
      (e) => typeof e.featureKey === 'string',
    ).map((e) => e.featureKey as FeatureKey);

    for (const sessions of [0, 10, 50, 999]) {
      const { features } = buildFeatureAccess({
        totalCompletedSessions: sessions,
      });
      for (const key of archivedKeys) {
        const avail = getFeatureAvailability(features[key]);
        expect(avail.canSubscribeToEvents).toBe(false);
      }
    }
  });
});
