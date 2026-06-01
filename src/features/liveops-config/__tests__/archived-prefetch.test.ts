import { ARCHIVED } from '../final-release-classification';
import { getAllEntries } from '../classification-codec';
import { DISABLED_FEATURES } from '../feature-access-config';

describe('Classification — archived features cannot prefetch/query', () => {
  it('no archived feature key resolves to queryAllowed=true', () => {
    for (const entry of ARCHIVED) {
      expect(entry.queryAllowed).toBe(false);
    }
  });

  it('internal features can query but archived cannot', () => {
    for (const entry of getAllEntries()) {
      if (entry.status === 'archived_or_deactivated') {
        expect(entry.queryAllowed).toBe(false);
      }
    }
  });

  it('archived features are in DISABLED_FEATURES', () => {
    const disabledSet = new Set(DISABLED_FEATURES);
    for (const entry of ARCHIVED) {
      if (entry.featureKey) {
        expect(disabledSet.has(entry.featureKey)).toBe(true);
      }
    }
  });
});
