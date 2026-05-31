import { ARCHIVED } from '../final-release-classification';
import type { FeatureKey } from '../feature-access';
import { buildFeatureAccess, getFeatureAvailability } from '../feature-access';

describe('Classification — archived features cannot appear in completion', () => {
  it('no archived entry has completionAllowed=true', () => {
    for (const entry of ARCHIVED) {
      expect(entry.completionAllowed).toBe(false);
    }
  });

  it('archived completion surfaces are hidden at all session counts', () => {
    for (const sessions of [0, 10, 50, 999]) {
      const { features } = buildFeatureAccess({
        totalCompletedSessions: sessions,
      });
      const archivedKeys: FeatureKey[] = ARCHIVED.filter(
        (e) => typeof e.featureKey === 'string',
      ).map((e) => e.featureKey as FeatureKey);

      for (const key of archivedKeys) {
        const avail = getFeatureAvailability(features[key]);
        expect(avail.canRenderEntryPoint).toBe(false);
        expect(avail.canQuery).toBe(false);
      }
    }
  });
});
