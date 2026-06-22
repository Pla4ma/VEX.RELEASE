import {
  purchaseTheme,
  canPurchaseTheme,
  getSelectableThemes,
  getOwnedSessionThemeIds,
} from '../service';

jest.mock('../../../features/economy/service');
jest.mock('../../../features/economy/wallet-service');

const TEST_USER_ID = 'test-user-123';

describe('Themes Service — Purchases & Unlocks', () => {
  describe('purchaseTheme', () => {
    it('succeeds for free themes', async () => {
      const result = await purchaseTheme(TEST_USER_ID, 'default', null);
      expect(result.success).toBe(true);
      expect(result.errorMessage).toBeNull();
    });

    it('returns error for non-free themes (purchases disabled)', async () => {
      const result = await purchaseTheme(TEST_USER_ID, 'deep-ocean', null);
      expect(result.success).toBe(false);
      expect(result.errorMessage).toBeTruthy();
    });

    it('returns error for legendary without streak', async () => {
      const result = await purchaseTheme(TEST_USER_ID, 'legendary', { longestDays: 5 });
      expect(result.success).toBe(false);
    });

    it('rejects legendary when purchases disabled', async () => {
      const result = await purchaseTheme(TEST_USER_ID, 'legendary', { longestDays: 30 });
      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('not available');
    });
  });

  describe('canPurchaseTheme', () => {
    it('allows free themes', () => {
      const result = canPurchaseTheme('default', null);
      expect(result.allowed).toBe(true);
      expect(result.message).toBeNull();
    });

    it('blocks legendary without 30-day streak', () => {
      const result = canPurchaseTheme('legendary', { longestDays: 5 });
      expect(result.allowed).toBe(false);
      expect(result.message).toContain('30');
    });

    it('allows legendary with 30-day streak', () => {
      const result = canPurchaseTheme('legendary', { longestDays: 30 });
      expect(result.allowed).toBe(true);
    });
  });

  describe('getSelectableThemes', () => {
    it('returns all themes with ownership status', async () => {
      const themes = await getSelectableThemes(TEST_USER_ID, null);
      expect(themes.length).toBeGreaterThan(0);
      const freeThemes = themes.filter((t) => t.isOwned);
      expect(freeThemes.length).toBeGreaterThan(0);
    });

    it('marks legendary description based on streak', async () => {
      const themes = await getSelectableThemes(TEST_USER_ID, { longestDays: 5 });
      const legendary = themes.find((t) => t.id === 'legendary');
      if (legendary) {
        expect(legendary.description).toContain('30');
      }
    });
  });

  describe('getOwnedSessionThemeIds', () => {
    it('returns free theme ids for any user', async () => {
      const ids = await getOwnedSessionThemeIds(TEST_USER_ID);
      expect(ids.length).toBeGreaterThan(0);
    });
  });
});
