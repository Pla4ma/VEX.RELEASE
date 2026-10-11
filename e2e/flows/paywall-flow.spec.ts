import { test, expect } from '@playwright/test';
import { expectNoHorizontalOverflow, openLogin } from '../helpers/app';

test.describe('Premium boundary', () => {
  test('unauthenticated users cannot reach premium settings', async ({ page }) => {
    await openLogin(page);
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/login$/);
    await expectNoHorizontalOverflow(page);
  });

  test('the login surface contains no archived economy CTA', async ({ page }) => {
    await openLogin(page);
    await expect(page.getByText(/shop|wallet|chest|battle pass/i)).toHaveCount(0);
  });

  test('authentication remains available through the core email path', async ({ page }) => {
    await openLogin(page);
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await expect(page.getByRole('button', { name: 'Enter VEX' })).toBeVisible();
  });

  test('premium surfaces are not exposed by an unauthenticated deep link', async ({ page }) => {
    await openLogin(page);
    await page.goto('/paywall');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText(/upgrade|premium/i)).toHaveCount(0);
  });
});
