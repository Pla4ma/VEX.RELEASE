import { experience } from './product-journey-debloat-personalization-helpers';

describe('Risk 5 — Privacy inventory ↔ app manifest', () => {
  it('privacy inventory matches app manifest metadata', () => {
    const {
      PRIVACY_INVENTORY,
      getDataCategories,
      getPiiFields,
      getTrackingFields,
    } = require('../privacy/PrivacyInventory');

    const {
      PRIVACY_NUTRITION_LABEL,
    } = require('../app-store/AppStoreSubmissionPack');

    const categories = getDataCategories();
    const inventoryCategories = categories.map(
      (c: { category: string }) => c.category,
    );

    expect(inventoryCategories).toContain('Identifiers');
    expect(inventoryCategories).toContain('Usage Data');
    expect(inventoryCategories).toContain('Diagnostics');
    expect(inventoryCategories).toContain('Purchases');
    expect(inventoryCategories).toContain('Contact Info');
    expect(inventoryCategories).toContain('User Content');

    const linkedFromInventory = PRIVACY_INVENTORY.filter(
      (item: { linkedToUser: boolean }) => item.linkedToUser,
    ).map((item: { category: string }) => item.category);

    for (const label of PRIVACY_NUTRITION_LABEL.dataLinkedToUser) {
      expect(
        linkedFromInventory.some((cat: string) =>
          label.toLowerCase().includes(cat.toLowerCase()),
        ),
      ).toBe(true);
    }

    expect(getPiiFields()).toEqual([
      'Email address',
      'Push notification token',
    ]);

    expect(getTrackingFields()).toEqual([]);

    const hasTracking = categories.some(
      (c: { usedForTracking: boolean }) => c.usedForTracking,
    );
    expect(hasTracking).toBe(false);
  });

  it('app store description excludes hidden feature names', () => {
    const {
      APP_STORE_METADATA,
    } = require('../app-store/AppStoreSubmissionPack');

    const description = APP_STORE_METADATA.description.toLowerCase();
    const forbidden = [
      'battle pass',
      'shop',
      'inventory',
      'wagers',
      'rivals',
      'squads',
      'guild',
      'leaderboard',
    ];
    for (const term of forbidden) {
      expect(description).not.toContain(term);
    }
  });

  it('app store review notes do not mention hidden features', () => {
    const { REVIEW_NOTES } = require('../app-store/AppStoreSubmissionPack');

    const forbidden = [
      'wagers',
      'rivals',
      'squads',
      'guild',
      'boss combat',
    ];
    for (const term of forbidden) {
      expect(REVIEW_NOTES.toLowerCase()).not.toContain(term);
    }
  });

  it('review notes focus on core public features only', () => {
    const { REVIEW_NOTES } = require('../app-store/AppStoreSubmissionPack');

    expect(REVIEW_NOTES).toContain('Premium');
    expect(REVIEW_NOTES).toContain('completion screen with progress proof');
    expect(REVIEW_NOTES).toContain('Delete Account');
    expect(REVIEW_NOTES).toContain('No coins');
    expect(REVIEW_NOTES).toContain('No paywall before session 5');
    expect(REVIEW_NOTES).toContain('No login required');
  });
});
