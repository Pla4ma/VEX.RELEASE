import { test, expect } from '@playwright/test';
import { expectNoHorizontalOverflow, openLogin } from '../helpers/app';

test.describe('Streak authentication boundary', () => {
  test('signed-out users cannot see another user streak', async ({ page }) => {
    await openLogin(page);
    await expect(page.getByTestId('streak-indicator')).toHaveCount(0);
    await expect(page.getByTestId('streak-count')).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
  });

  test('streak risk notifications cannot open a protected surface signed out', async ({ page }) => {
    await openLogin(page);
    await page.goto('/streak-risk');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText(/protect|save streak/i)).toHaveCount(0);
  });

  test('archived streak insurance is not exposed at login', async ({ page }) => {
    await openLogin(page);
    await expect(page.getByText(/insurance|shield|gamble/i)).toHaveCount(0);
  });

  test('streak funeral routes return to authentication', async ({ page }) => {
    await openLogin(page);
    await page.goto('/streak-funeral');
    await expect(page).toHaveURL(/\/login$/);
  });
});
