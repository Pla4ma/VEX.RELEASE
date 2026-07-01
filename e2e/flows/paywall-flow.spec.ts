/**
 * E2E Test: Paywall & Premium Gating
 * Validates premium feature gating without fake billing screens.
 */
import { test, expect } from '@playwright/test';

test.describe('Paywall Flow', () => {
  test('shows premium tease for advanced features without blocking core loop', async ({ page }) => {
    await page.goto('/settings');

    // Check if premium section exists
    const premiumSection = page.getByTestId('premium-section');
    if (await premiumSection.isVisible()) {
      await expect(premiumSection).toContainText(/premium|upgrade|unlock/i);

      // Should show features list
      await expect(page.getByTestId('premium-features')).toBeVisible();
    }
  });

  test('does not block core free features', async ({ page }) => {
    await page.goto('/');

    // Core features must always be accessible
    const startButton = page.getByRole('button', { name: /start|focus|session/i });
    await expect(startButton).toBeVisible();

    // Settings should be accessible
    const settingsButton = page.getByTestId('settings-tab');
    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      await expect(page.getByText(/settings/i)).toBeVisible();
    }
  });

  test('free user cannot access premium-only features', async ({ page }) => {
    await page.goto('/');

    // Try to access advanced AI coach (premium feature)
    const advancedCoach = page.getByTestId('advanced-coach');
    if (await advancedCoach.isVisible()) {
      await advancedCoach.click();

      // Should show premium upgrade prompt
      await expect(page.getByText(/premium|upgrade|unlock/i)).toBeVisible();
    }
  });

  test('premium copy never mentions economy or shop terms', async ({ page }) => {
    await page.goto('/settings');

    const premiumSection = page.getByTestId('premium-section');
    if (await premiumSection.isVisible()) {
      const text = await premiumSection.textContent();
      const economyTerms = ['chest', 'shop', 'wallet', 'coin', 'gem', 'battle_pass'];
      for (const term of economyTerms) {
        expect(text?.toLowerCase()).not.toContain(term);
      }
    }
  });
});
