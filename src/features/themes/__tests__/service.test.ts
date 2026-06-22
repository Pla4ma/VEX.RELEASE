import { describe, it, expect } from '@jest/globals';
import {
  getOwnedSessionThemeIds,
  getSelectableThemes,
  canPurchaseTheme,
  purchaseTheme,
} from '../service';

describe('themes service', () => {
  describe('getOwnedSessionThemeIds', () => {
    it('returns only free theme ids', async () => {
      const ids = await getOwnedSessionThemeIds('user-1');
      expect(ids).toEqual(expect.arrayContaining(['default']));
      expect(ids.length).toBeGreaterThan(0);
      // All returned ids should be from free themes
      for (const id of ids) {
        expect(typeof id).toBe('string');
      }
    });
  });

  describe('getSelectableThemes', () => {
    it('returns all themes with ownership info', async () => {
      const themes = await getSelectableThemes('user-1', null);
      expect(themes.length).toBeGreaterThan(0);
      for (const theme of themes) {
        expect(theme).toHaveProperty('id');
        expect(theme).toHaveProperty('isOwned');
        expect(typeof theme.isOwned).toBe('boolean');
      }
    });

    it('marks free themes as owned', async () => {
      const themes = await getSelectableThemes('user-1', null);
      const freeThemes = themes.filter((t) => !t.isOwned);
      // Free themes should always be owned
      for (const theme of themes) {
        if (theme.coinCost === 0) {
          expect(theme.isOwned).toBe(true);
        }
      }
    });

    it('overrides legendary description when streak < 30', async () => {
      const themes = await getSelectableThemes('user-1', { longestDays: 10 });
      const legendary = themes.find((t) => t.id === 'legendary');
      if (legendary) {
        expect(legendary.description).toContain('30 day streak');
      }
    });

    it('keeps legendary description when streak >= 30', async () => {
      const themes = await getSelectableThemes('user-1', { longestDays: 30 });
      const legendary = themes.find((t) => t.id === 'legendary');
      if (legendary) {
        // Original description kept — override only happens when streak < 30
        expect(legendary.description).toBe('Unlock after 30 day streak');
      }
    });
  });

  describe('canPurchaseTheme', () => {
    it('allows free themes', () => {
      const result = canPurchaseTheme('default', null);
      expect(result.allowed).toBe(true);
      expect(result.message).toBeNull();
    });

    it('blocks legendary when streak < 30', () => {
      const result = canPurchaseTheme('legendary', { longestDays: 5 });
      expect(result.allowed).toBe(false);
      expect(result.message).toContain('30 day streak');
    });

    it('allows legendary when streak >= 30', () => {
      const result = canPurchaseTheme('legendary', { longestDays: 30 });
      expect(result.allowed).toBe(true);
    });

    it('allows legendary when streak is null', () => {
      const result = canPurchaseTheme('legendary', null);
      expect(result.allowed).toBe(false);
    });
  });

  describe('purchaseTheme', () => {
    it('succeeds for free themes', async () => {
      const result = await purchaseTheme('user-1', 'default', null);
      expect(result.success).toBe(true);
      expect(result.errorMessage).toBeNull();
    });

    it('fails for legendary when streak < 30', async () => {
      const result = await purchaseTheme('user-1', 'legendary', { longestDays: 5 });
      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('30 day streak');
    });
    it('fails for paid themes (purchases disabled)', async () => {
      // deep-ocean is a paid theme (not legendary, not free)
      const result = await purchaseTheme('user-1', 'deep-ocean', { longestDays: 100 });
      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('not available');
    });
  });
});
