import {
  getOwnedSessionThemeIds,
  getSelectableThemes,
  canPurchaseTheme,
  purchaseTheme,
} from '../service';
import type { SessionTheme } from '../session-themes';

jest.mock('../../../features/economy/service');

const TEST_USER_ID = 'test-user-123';

describe('Themes Service', () => {
  describe('getOwnedSessionThemeIds', () => {
    it('returns free theme ids', async () => {
      const ids = await getOwnedSessionThemeIds(TEST_USER_ID);
      expect(ids.length).toBeGreaterThan(0);
      expect(ids.every((id) => typeof id === 'string')).toBe(true);
    });
  });

  describe('getSelectableThemes', () => {
    it('returns all session themes', async () => {
      const themes = await getSelectableThemes(TEST_USER_ID, null);
      expect(themes.length).toBeGreaterThan(0);
      expect(themes[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        isOwned: expect.any(Boolean),
      });
    });

    it('marks free themes as owned', async () => {
      const themes = await getSelectableThemes(TEST_USER_ID, null);
      const freeThemes = themes.filter((t) => t.isOwned);
      expect(freeThemes.length).toBeGreaterThan(0);
    });

    it('includes legendary theme with conditional description', async () => {
      const themes = await getSelectableThemes(TEST_USER_ID, { longestDays: 5 });
      const legendary = themes.find((t) => t.id === 'legendary');
      if (legendary) {
        expect(legendary.description).toContain('30 day');
      }
    });
  });

  describe('canPurchaseTheme', () => {
    it('allows free themes', () => {
      const freeTheme = canPurchaseTheme('default', null);
      expect(freeTheme.allowed).toBe(true);
    });

    it('blocks legendary theme without 30-day streak', () => {
      const result = canPurchaseTheme('legendary', { longestDays: 5 });
      expect(result.allowed).toBe(false);
      expect(result.message).toContain('30');
    });

    it('allows legendary theme with 30-day streak', () => {
      const result = canPurchaseTheme('legendary', { longestDays: 30 });
      expect(result.allowed).toBe(true);
    });
  });

  describe('purchaseTheme', () => {
    it('succeeds for free themes', async () => {
      const result = await purchaseTheme(TEST_USER_ID, 'default', null);
      expect(result.success).toBe(true);
      expect(result.errorMessage).toBeNull();
    });

    it('returns error for non-free themes', async () => {
      const result = await purchaseTheme(TEST_USER_ID, 'deep-ocean', null);
      expect(result.success).toBe(false);
      expect(result.errorMessage).toBeTruthy();
    });

    it('returns error for legendary without streak', async () => {
      const result = await purchaseTheme(TEST_USER_ID, 'legendary', { longestDays: 5 });
      expect(result.success).toBe(false);
      expect(result.message ?? result.errorMessage).toBeTruthy();
    });
  });
});
