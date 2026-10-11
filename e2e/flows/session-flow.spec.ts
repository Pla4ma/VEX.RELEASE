import { test, expect } from '@playwright/test';
import { expectNoHorizontalOverflow, openLogin } from '../helpers/app';

test.describe('Session authentication boundary', () => {
  test('session routes cannot be entered without authentication', async ({ page }) => {
    await openLogin(page);
    await page.goto('/session');
    await expect(page).toHaveURL(/\/login$/);
    await expectNoHorizontalOverflow(page);
  });

  test('login exposes the real email path instead of a test session', async ({ page }) => {
    await openLogin(page);
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByText(/focus mode|session active/i)).toHaveCount(0);
  });

  test('completion surfaces are not reachable from a signed-out browser', async ({ page }) => {
    await openLogin(page);
    await page.goto('/session/complete');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText(/first victory|coins earned/i)).toHaveCount(0);
  });
});
