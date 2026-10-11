import { test, expect } from '@playwright/test';
import { expectNoHorizontalOverflow, openEmailForm, openLogin } from './helpers/app';

test.describe('Onboarding entry boundary', () => {
  test('unauthenticated users are held at the real login entry', async ({ page }) => {
    await openLogin(page);
    await expectNoHorizontalOverflow(page);
    await expect(page.getByRole('button', { name: 'Continue with Apple' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue with Email' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Skip login and onboarding' })).toBeVisible();
  });

  test('email onboarding entry exposes a validated credential form', async ({ page }) => {
    await openLogin(page);
    await openEmailForm(page);
    await page.getByRole('button', { name: 'Enter VEX' }).click();
    await expect(page.getByText(/email|password/i).first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});
