import { test, expect } from '@playwright/test';
import { openLogin } from '../helpers/app';
import { mockSupabaseRest } from '../helpers/mock-supabase';

test.describe('Local authenticated navigation', () => {
  test('skip login reaches Home and opens Study and Progress', async ({ page }) => {
    await mockSupabaseRest(page);
    await openLogin(page);
    await page.getByRole('button', { name: 'Skip login and onboarding' }).click();

    await expect(page.getByRole('button', { name: 'Start focus session' })).toBeVisible({ timeout: 20_000 });

    await page.getByRole('button', { name: 'Open Study', exact: true }).click();
    await expect(page.getByText('Study Library', { exact: true })).toBeVisible({ timeout: 20_000 });

    await page.getByRole('button', { name: 'Go back' }).click();
    await page.getByRole('button', { name: 'Ask VEX Coach' }).first().click();
    await expect(page.getByRole('button', { name: 'Close AI Coach' })).toBeVisible({ timeout: 20_000 });
    await page.getByPlaceholder('Ask your coach anything...').fill('Help me study');
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByText(/Local coach mode is ready/i)).toBeVisible({ timeout: 20_000 });
    await page.getByRole('button', { name: 'Close AI Coach' }).click();
    await expect(page.getByRole('button', { name: 'Open progress' })).toBeVisible({ timeout: 20_000 });
    await page.getByRole('button', { name: 'Open progress' }).click();
    await expect(page.getByText('Your focus record.', { exact: true })).toBeVisible({
      timeout: 20_000,
    });
  });
});
