import { test, expect } from '@playwright/test';
import { expectNoHorizontalOverflow, openLogin } from '../helpers/app';

test.describe('Onboarding to first-session boundary', () => {
  test('login is the only unauthenticated onboarding entry', async ({ page }) => {
    await openLogin(page);
    await expect(page.getByText(/focus adapts to you/i)).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('protected home entry does not expose another user session', async ({ page }) => {
    await openLogin(page);
    await page.goto('/home');
    await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
    await expect(page.getByText(/start first session|first victory/i)).toHaveCount(0);
  });

  test('protected session entry does not bypass authentication', async ({ page }) => {
    await openLogin(page);
    await page.goto('/session');
    await expect(page.getByRole('button', { name: 'Continue with Email' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});
