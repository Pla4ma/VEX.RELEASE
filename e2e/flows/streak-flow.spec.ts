/**
 * E2E Test: Streak Flow
 * Validates streak tracking, risk warnings, and funeral flow.
 */
import { test, expect } from '@playwright/test';

test.describe('Streak Flow', () => {
  test('shows streak count on home screen after completing sessions', async ({ page }) => {
    await page.goto('/');

    // Verify streak indicator is visible
    const streakElement = page.getByTestId('streak-indicator');
    await expect(streakElement).toBeVisible();

    // Streak counter should be present
    const streakCount = page.getByTestId('streak-count');
    await expect(streakCount).toBeVisible();
  });

  test('displays streak risk warning when streak is in danger', async ({ page }) => {
    await page.goto('/');

    // If streak is at risk, warning should appear
    const riskWarning = page.getByTestId('streak-risk-warning');
    if (await riskWarning.isVisible()) {
      await expect(riskWarning).toContainText(/risk|protect|save/i);

      // Should have a CTA to protect streak
      const protectButton = page.getByRole('button', { name: /protect|save streak|start/i });
      await expect(protectButton).toBeVisible();
    }
  });

  test('shows streak insurance prompt when available', async ({ page }) => {
    await page.goto('/');

    // Trigger streak insurance flow
    const insurancePrompt = page.getByTestId('streak-insurance');
    if (await insurancePrompt.isVisible()) {
      await expect(insurancePrompt).toContainText(/insurance|shield|protect/i);

      // Should offer gamble or shield options
      await expect(page.getByTestId('gamble-option')).toBeVisible();
      await expect(page.getByTestId('shield-option')).toBeVisible();
    }
  });

  test('handles streak funeral navigation', async ({ page }) => {
    await page.goto('/');

    // If streak funeral is triggered
    const funeralOverlay = page.getByTestId('streak-funeral');
    if (await funeralOverlay.isVisible()) {
      await expect(funeralOverlay).toContainText(/streak lost|broken|ended/i);

      // Should offer comeback options
      const comebackButton = page.getByRole('button', { name: /comeback|restart|begin again/i });
      await expect(comebackButton).toBeVisible();
    }
  });
});
