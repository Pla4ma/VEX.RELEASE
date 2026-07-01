/**
 * E2E Test: Session Flow
 * Validates completing a focus session end-to-end with XP and streak tracking.
 */
import { test, expect } from '@playwright/test';

test.describe('Session Flow', () => {
  test('completes a Light Focus session and sees completion screen', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('VEX')).toBeVisible();

    // Navigate to session setup
    await page.getByRole('button', { name: /focus|start/i }).click();

    // Select Light Focus mode
    await page.getByText(/light focus/i).click();

    // Set duration to 5 minutes
    await page.getByTestId('duration-picker').click();
    await page.getByText('5 min').click();

    // Start session
    await page.getByRole('button', { name: /start/i }).click();

    // Verify session is active
    await expect(page.getByText(/focus mode|session active/i)).toBeVisible();

    // Fast-forward timer for testing
    await page.evaluate(() =>
      window.localStorage.setItem('test_fast_forward', '300000'),
    );

    // Complete session
    await page.getByRole('button', { name: /complete|end/i }).click();

    // Verify completion screen
    await expect(page.getByText(/session complete|nice work|well done/i)).toBeVisible();

    // Verify XP awarded
    await expect(page.getByText(/\+.*XP/)).toBeVisible();

    // Verify streak maintained
    await expect(page.getByText(/streak/i)).toBeVisible();
  });

  test('handles session pause and resume', async ({ page }) => {
    await page.goto('/session');
    await page.getByTestId('quick-start-sprint').click();
    await page.getByRole('button', { name: /start/i }).click();

    // Pause session
    await page.getByRole('button', { name: /pause/i }).click();
    await expect(page.getByText(/paused/i)).toBeVisible();

    // Resume session
    await page.getByRole('button', { name: /resume/i }).click();
    await expect(page.getByText(/focus mode|session active/i)).toBeVisible();
  });

  test('handles session abandonment with recovery', async ({ page }) => {
    await page.goto('/session');
    await page.getByTestId('quick-start-flow').click();
    await page.getByRole('button', { name: /start/i }).click();

    // Abandon session
    await page.getByRole('button', { name: /abandon|end/i }).click();
    await page.getByText(/yes|confirm|abandon/i).click();

    // Verify recovery prompt
    await expect(page.getByText(/complete|recover|try again/i)).toBeVisible();
  });
});
