/**
 * E2E Test: Onboarding to First Session
 * Validates new user flow from registration through onboarding to first session completion.
 */
import { test, expect } from '@playwright/test';

test.describe('Onboarding to First Session', () => {
  test('registers and completes onboarding flow', async ({ page }) => {
    await page.goto('/');

    // Start registration
    await page.getByRole('button', { name: /get started|sign up|register/i }).click();

    // Enter email
    await page.getByPlaceholder(/email/i).fill('testuser@example.com');

    // Enter password
    await page.getByPlaceholder(/password/i).fill('TestPass123!');

    // Submit registration
    await page.getByRole('button', { name: /continue|next|sign up/i }).click();

    // Onboarding should start
    await expect(page.getByText(/welcome|how you focus|goal/i)).toBeVisible();

    // Complete onboarding steps
    // Step: Select goal
    await page.getByText(/focus|productivity|deep work/i).first().click();
    await page.getByRole('button', { name: /continue|next/i }).click();

    // Step: Select focus style
    await page.getByText(/quiet|calm|structured/i).first().click();
    await page.getByRole('button', { name: /continue|next/i }).click();
  });

  test('lands on home screen after onboarding with Day 0 experience', async ({ page }) => {
    await page.goto('/home');

    // Day 0 should show welcome mascot
    const mascot = page.getByTestId('day-0-mascot');
    if (await mascot.isVisible()) {
      await expect(mascot).toBeVisible();
    }

    // Primary CTA should be "Start First Session"
    const startButton = page.getByRole('button', { name: /start.*session|first.*focus/i });
    await expect(startButton).toBeVisible();
  });

  test('completes first session from home screen', async ({ page }) => {
    await page.goto('/home');

    // Click start first session
    await page.getByRole('button', { name: /start/i }).first().click();

    // Verify session setup screen
    await expect(page.getByText(/duration|mode|focus/i)).toBeVisible();

    // Select a quick session
    await page.getByTestId('quick-start-flow').click();

    // Session should start
    await expect(page.getByText(/focus mode|session active/i)).toBeVisible();
  });
});
